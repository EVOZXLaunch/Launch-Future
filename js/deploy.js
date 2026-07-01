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

// Human-readable translations for the factory contract's own custom
// errors (see abi/evoz/LFTFactory.json). When factory.js manages to
// decode a revert down to one of these names, we can tell the user
// exactly what's wrong instead of a generic "rejected by the network".
const CONTRACT_ERROR_MESSAGES = {
    SymbolExists:            "This token symbol is already taken on this network. Choose a different symbol.",
    InvalidDeployFee:        "The deploy fee has changed on-chain since this page loaded. Please try again to use the current fee.",
    InsufficientNativeFee:   "The amount sent doesn't match the required native deploy fee. Refresh the fee and try again.",
    InsufficientAllowance:   "Your wallet hasn't approved enough allowance for the selected payment token.",
    InsufficientTokenBalance:"Your wallet doesn't have enough balance of the selected payment token to cover the deploy fee.",
    InvalidName:             "Token name is invalid — check its length and characters.",
    InvalidSymbol:           "Token symbol is invalid — check its length and characters.",
    InvalidSupply:           "Initial supply is invalid for this configuration.",
    InvalidMaxSupply:        "Max supply is invalid — it must be greater than or equal to the initial supply.",
    InvalidSecurityConfig:   "One of the security settings (max wallet %, max tx %, anti-bot blocks, or trading delay) is outside the range the contract allows. Try disabling one of those features and deploying again.",
    InvalidPercent:          "One of the percentage values used in this configuration is outside the allowed range.",
    InvalidTaxShares:        "Tax share percentages don't add up the way the contract expects.",
    InvalidTreasury:         "The factory's configured treasury address is invalid. Contact the admin.",
    InvalidTreasuryWallet:   "The treasury wallet address in this configuration is invalid.",
    InvalidMarketingWallet:  "The marketing wallet address in this configuration is invalid.",
    InvalidDevelopmentWallet:"The development wallet address in this configuration is invalid.",
    InvalidLiquidityWallet:  "The liquidity wallet address in this configuration is invalid.",
    InvalidBuybackWallet:    "The buyback wallet address in this configuration is invalid.",
    InvalidCharityWallet:    "The charity wallet address in this configuration is invalid.",
    BuyTaxLimit:             "Buy tax exceeds the maximum the contract allows.",
    SellTaxLimit:            "Sell tax exceeds the maximum the contract allows.",
    TransferTaxLimit:        "Transfer tax exceeds the maximum the contract allows.",
    FactoryPaused:           "Token deployments are currently paused on this network. Try again later.",
    NotNativePayment:        "The selected payment method isn't a native-coin payment. Pick an ERC-20 payment method instead.",
    UseNativeDeploy:         "The selected payment method requires paying with the native coin, not an ERC-20 permit.",
    UseDeployFunction:       "This payment method must go through the standard deploy flow.",
    PaymentDisabled:         "The selected payment method is currently disabled by the factory admin. Pick another one.",
    ZeroUtilityTokenQuote:   "Couldn't get a valid price quote for the utility token payment. Try again shortly.",
    UtilityTokenNotReceived: "The utility token payment wasn't received by the contract. Check your token approval.",
    InvalidExchange:         "The factory's configured exchange contract address is invalid. Contact the admin.",
    InvalidPaymentToken:     "The configured payment token address is invalid. Contact the admin.",
    InvalidAmount:           "The amount provided is invalid.",
    InvalidDeployer:         "The factory's configured deployer contract address is invalid. Contact the admin.",
    FeeTransferFailed:       "The fee payment transfer failed on-chain.",
    BurnTransferFailed:      "The burn portion of the fee failed to transfer on-chain.",
    TreasuryTransferFailed:  "The treasury portion of the fee failed to transfer on-chain.",
    ReentrancyGuardReentrantCall: "The contract rejected a reentrant call. Please try again."
};

function normalizeError(error) {
    if (error?.code === 4001 || error?.code === "ACTION_REJECTED")
        return new Error("Transaction rejected by user.");

    // factory.js decorates decodable reverts with the contract's own
    // custom error name — translate that first, it's always more
    // precise than pattern-matching a raw message string.
    if (error?.contractErrorName) {
        const known = CONTRACT_ERROR_MESSAGES[error.contractErrorName];
        return new Error(
            known
                ? known
                : `The contract rejected this deployment (${error.contractErrorName}).`
        );
    }

    const raw = (error?.reason || error?.shortMessage || error?.info?.error?.message || error?.message || "").toString();

    if (/InvalidDeployFee/i.test(raw))
        return new Error("Deploy fee has changed on-chain. Please try again to use the current fee.");
    if (/insufficient funds/i.test(raw))
        return new Error("Insufficient balance to cover the deploy fee and gas.");
    if (/SymbolTaken|symbol.*exists/i.test(raw))
        return new Error("This token symbol is already taken. Please choose another.");

    // ethers surfaces "missing revert data" / CALL_EXCEPTION when the
    // pre-flight simulation reverts but the RPC node doesn't return a
    // decodable revert reason at all (common on non-standard/lesser-known
    // RPC endpoints). We already tried to decode it in factory.js and
    // couldn't, so give the user concrete things to check instead of the
    // raw ethers object.
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
