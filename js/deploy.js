// =====================================================
// LaunchFuture
// Deploy Manager (updated with full payment support)
// =====================================================

import { connectWallet, isConnected, getSigner, getChainId } from "./wallet.js";
import { deployWithNative, deployWithPermit, getFactory } from "./factory.js";
import { validateTokenConfig } from "./validation.js";
import { getSelectedPayment, signPermit, refreshDeployFee } from "./payment.js";
import { getCurrentNetwork } from "./networks/index.js";
import { getContract, isAddress, ZeroAddress, parseUnits } from "./blockchain.js";
import { loadABI } from "./abi/loader.js";
import { DEPLOY } from "./config.js";

// =====================================================
// Status
// =====================================================

export const DEPLOY_STATUS = Object.freeze({
    IDLE:           "IDLE",
    VALIDATING:     "VALIDATING",
    CONNECTING:     "CONNECTING",
    SIGNING_PERMIT: "SIGNING_PERMIT",
    WAIT_SIGNATURE: "WAIT_SIGNATURE",
    PENDING:        "PENDING",
    SUCCESS:        "SUCCESS",
    FAILED:         "FAILED"
});

let deployStatus = DEPLOY_STATUS.IDLE;

export const getDeployStatus   = () => deployStatus;
export const resetDeployStatus = () => { deployStatus = DEPLOY_STATUS.IDLE; };
const setStatus = s => { deployStatus = s; };

// =====================================================
// Config builders
// =====================================================

// Flat shape used only for client-side validation (validateTokenConfig
// expects top-level name/symbol/owner/supply/decimals/mintable/burnable).
export function buildValidationConfig(data) {
    return {
        name:     data.name,
        symbol:   data.symbol,
        owner:    data.owner,
        supply:   data.supply,
        decimals: data.decimals ?? 18,
        mintable: Boolean(data.features?.mintable),
        burnable: Boolean(data.features?.burnable)
    };
}

// Nested shape the LFTFactory contract actually accepts. The contract's
// token decimals are fixed at 18 (there's no `decimals` field in the ABI's
// TokenConfig struct), matching the single "18" option in the UI.
export function buildTokenConfig(data) {
    const f = data.features || {};
    const owner = data.owner;
    const initialSupply = parseUnits(String(data.supply), 18);

    // There's currently no UI control for a separate max-supply cap, so a
    // mintable token's ceiling defaults to its initial supply. If you add a
    // max-supply field to the wizard, wire it in here instead of this default.
    const maxSupply = initialSupply;

    return {
        name:   data.name,
        symbol: data.symbol,
        owner,
        supply: {
            initialSupply,
            maxSupply,
            mintable: Boolean(f.mintable),
            burnable: Boolean(f.burnable)
        },
        security: {
            antiBot:            Boolean(f.antiBot),
            blacklist:          Boolean(f.blacklist),
            whitelist:          Boolean(f.whitelist),
            tradingDelay:       Boolean(f.tradingDelay),
            maxWalletEnabled:   Boolean(f.maxWalletEnabled),
            maxTxEnabled:       Boolean(f.maxTxEnabled),
            // No numeric inputs exist yet for these in the UI — sensible
            // defaults are used whenever the related toggle is on.
            maxWalletPercent:    f.maxWalletEnabled ? 200 : 0,   // 2.00%
            maxTxPercent:        f.maxTxEnabled ? 100 : 0,       // 1.00%
            antiBotBlocks:       f.antiBot ? 3 : 0,
            tradingDelaySeconds: f.tradingDelay ? 30 : 0
        },
        // No tax UI exists in the current wizard, so all tax features stay
        // disabled/zeroed. Wallet fields still need a valid address even
        // when unused, so they default to the token owner.
        taxes: {
            buyTaxEnabled:      false,
            sellTaxEnabled:     false,
            transferTaxEnabled: false,
            buyTax:             0,
            sellTax:            0,
            transferTax:        0,
            burnShare:          0,
            marketingShare:     0,
            developmentShare:   0,
            treasuryShare:      0,
            liquidityShare:     0,
            buybackShare:       0,
            charityShare:       0,
            marketingWallet:    owner,
            developmentWallet:  owner,
            treasuryWallet:     owner,
            liquidityWallet:    owner,
            buybackWallet:      owner,
            charityWallet:      owner
        }
    };
}

export function buildMetadata(data) {
    return {
        website:  data.website  || "",
        telegram: data.telegram || "",
        twitter:  data.twitter  || "",
        logoURI:  data.logoURI  || ""
    };
}

// =====================================================
// Deploy
// =====================================================

export async function deployToken(config, metadata) {
    try {
        setStatus(DEPLOY_STATUS.CONNECTING);
        if (!isConnected()) await connectWallet();

        const network = getCurrentNetwork();
        if (Number(getChainId()) !== Number(network.chainId)) {
            throw new Error(`Your wallet is on the wrong network. Switch to ${network.name} and try again.`);
        }

        setStatus(DEPLOY_STATUS.VALIDATING);
        const validation = await validateTokenConfig(buildValidationConfig({
            name:   config.name,
            symbol: config.symbol,
            owner:  config.owner,
            supply: config.supply?.initialSupply !== undefined
                ? config.supply.initialSupply
                : config.supply,
            decimals: 18,
            features: { mintable: config.supply?.mintable, burnable: config.supply?.burnable }
        }));
        if (!validation.valid) throw validation;

        if (!isAddress(config.owner) || config.owner === ZeroAddress) {
            throw new Error("Owner address is missing or invalid.");
        }

        let payment = getSelectedPayment();
        if (!payment) throw new Error("No payment method selected.");

        // Re-read the fee straight from the contract right before we pay —
        // an admin may have changed it since the page loaded, and paying a
        // stale amount would make the transaction revert.
        payment = await refreshDeployFee(payment.symbol);

        setStatus(DEPLOY_STATUS.WAIT_SIGNATURE);

        let result;

        if (payment.isNative) {
            // ── Native coin payment (e.g. EVOZ) ──
            result = await deployWithNative(config, metadata, payment.fee);

        } else {
            // ── ERC-20 permit payment (e.g. LFT) ──
            setStatus(DEPLOY_STATUS.SIGNING_PERMIT);
            const signer      = await getSigner();
            const network     = getCurrentNetwork();
            const tokenABI    = await loadABI("LaunchFutureToken");
            const tokenContract = await getContract(network.contracts.token, tokenABI);
            const factory     = await getFactory();
            const factoryAddr = await factory.getAddress();
            const deadline    = BigInt(Math.floor(Date.now() / 1000) + 3600); // 1 hour

            const { v, r, s } = await signPermit(
                signer,
                tokenContract,
                factoryAddr,
                payment.fee,
                deadline
            );

            setStatus(DEPLOY_STATUS.WAIT_SIGNATURE);
            result = await deployWithPermit(
                config, metadata,
                payment.symbol,
                deadline, v, r, s
            );
        }

        setStatus(DEPLOY_STATUS.SUCCESS);
        return buildDeployResult(result, payment);

    } catch (error) {
        setStatus(DEPLOY_STATUS.FAILED);
        throw normalizeError(error);
    }
}

// =====================================================
// Helpers
// =====================================================

function normalizeError(error) {
    if (error?.code === 4001 || error?.code === "ACTION_REJECTED")
        return new Error("Transaction rejected by user.");

    const raw = (error?.reason || error?.shortMessage || error?.info?.error?.message || error?.message || "").toString();

    if (/InvalidDeployFee/i.test(raw))
        return new Error("Deploy fee has changed on-chain. Please try again to use the current fee.");
    if (/insufficient funds/i.test(raw))
        return new Error("Insufficient balance to cover the deploy fee and gas.");
    if (/SymbolTaken|symbol.*exists/i.test(raw))
        return new Error("This token symbol is already taken. Please choose another.");

    // ethers surfaces "missing revert data" / CALL_EXCEPTION when
    // estimateGas fails but the RPC node doesn't return a decoded revert
    // reason (common on non-standard/lesser-known RPC endpoints). The
    // transaction would revert, but we can't say exactly why — so give
    // the user concrete things to check instead of the raw ethers object.
    if (error?.code === "CALL_EXCEPTION" || /missing revert data/i.test(raw)) {
        return new Error(
            "The network rejected this deployment before it could run (no reason was returned). " +
            "This usually means: the symbol is already taken, the deploy fee changed, your wallet " +
            "doesn't have enough balance/allowance, or your wallet is on the wrong network. " +
            "Double-check these and try again."
        );
    }

    return error;
}

export function buildDeployResult(result, payment) {
    return {
        success:      true,
        payment,
        tokenAddress: result.tokenAddress,
        txHash:       result.txHash,
        blockNumber:  result.blockNumber,
        timestamp:    Date.now()
    };
}

export function buildVerifyPackage(result, config, metadata) {
    return {
        success:      result.success,
        tokenAddress: result.tokenAddress,
        txHash:       result.txHash,
        blockNumber:  result.blockNumber,
        timestamp:    result.timestamp,
        token:        { name: config.name, symbol: config.symbol, supply: config.supply, decimals: config.decimals },
        metadata:     { website: metadata.website, telegram: metadata.telegram, twitter: metadata.twitter, logoURI: metadata.logoURI }
    };
}

export const isDeployIdle       = () => deployStatus === DEPLOY_STATUS.IDLE;
export const isDeploying        = () => !["IDLE","SUCCESS","FAILED"].includes(deployStatus);
export const isDeploySuccessful = r  => Boolean(r?.success);
export const isDeployFailed     = () => deployStatus === DEPLOY_STATUS.FAILED;

export default { deployToken, buildTokenConfig, buildValidationConfig, buildMetadata, buildDeployResult, buildVerifyPackage,
                 getDeployStatus, resetDeployStatus, isDeployIdle, isDeploying, isDeploySuccessful, isDeployFailed };
