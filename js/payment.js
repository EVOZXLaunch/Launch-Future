// =====================================================
// LaunchFuture
// Payment Method Manager
// Loads available fee options from factory contract
// and handles native (EVOZ) + ERC-20 permit (LFT) flows
// =====================================================

import { getFactory, getDeployFee, getPaymentMethod } from "./factory.js";
import { getCurrentNetwork } from "./networks/index.js";
import { getContract } from "./blockchain.js";
import { formatUnits, parseUnits } from "https://esm.sh/ethers@6";

// =====================================================
// Known payment symbols to try loading
// Add more as you register them in the factory
// =====================================================

const CANDIDATE_SYMBOLS = ["EVOZ", "LFT", "USDT", "USDC", "BNB", "ETH", "DAI"];

// Minimal read-only ERC-20 ABI, just enough to fetch decimals dynamically
// so we never have to hardcode/guess a token's decimal precision.
const ERC20_DECIMALS_ABI = ["function decimals() view returns (uint8)"];

// =====================================================
// State
// =====================================================

let loadedMethods   = [];   // [{symbol, isNative, fee, feeFormatted, burnAmount, treasuryAmount, token, exchange, enabled}]
let selectedSymbol  = null;
const decimalsCache = new Map(); // tokenAddress(lowercase) -> decimals, avoids refetching per render

// =====================================================
// Decimals
// =====================================================

async function resolveDecimals(pm) {
    const network = getCurrentNetwork();

    // Native coin (e.g. EVOZ): decimals come from the network's own
    // currency definition, not a hardcoded constant.
    if (pm.isNative) {
        return network.currency?.decimals ?? network.decimals ?? 18;
    }

    const key = pm.token?.toLowerCase();
    if (key && decimalsCache.has(key)) {
        return decimalsCache.get(key);
    }

    try {
        const tokenContract = await getContract(pm.token, ERC20_DECIMALS_ABI, true);
        const decimals = Number(await tokenContract.decimals());
        if (key) decimalsCache.set(key, decimals);
        return decimals;
    } catch (err) {
        console.warn(`Could not read decimals() for ${pm.token}, falling back to 18.`, err);
        return 18;
    }
}

// =====================================================
// Load
// =====================================================

export async function loadPaymentMethods() {
    const network = getCurrentNetwork();
    const symbols = network.paymentSymbols ?? CANDIDATE_SYMBOLS;
    loadedMethods = [];

    for (const sym of symbols) {
        try {
            const pm = await getPaymentMethod(sym);
            if (!pm.enabled) continue;

            // getDeployFee returns (deployFee, burnAmount, treasuryAmount).
            // `deployFee` (index 0) is the FULL amount the wallet must pay —
            // burn/treasury are just how the contract internally splits it.
            // Using anything other than index 0 undercharges the user and
            // causes the on-chain deploy call to revert.
            const [deployFee, burnAmount, treasuryAmount] = await getDeployFee(sym);

            const decimals = await resolveDecimals(pm);

            loadedMethods.push({
                symbol:               sym,
                isNative:             pm.isNative,
                burnEnabled:          pm.burnEnabled,
                token:                pm.token,
                exchange:             pm.exchange,
                decimals,
                fee:                  deployFee,
                feeFormatted:         formatUnits(deployFee, decimals),
                burnAmount,
                treasuryAmount,
                burnAmountFormatted:      formatUnits(burnAmount, decimals),
                treasuryAmountFormatted:  formatUnits(treasuryAmount, decimals)
            });
        } catch (err) {
            // symbol not registered on this network, skip — but don't fail silently
            // in a way that's impossible to debug in production.
            console.warn(`Skipping payment method "${sym}":`, err?.shortMessage || err?.message || err);
        }
    }

    return loadedMethods;
}

// =====================================================
// Refresh a single fee (call right before charging the
// user, since an admin may change fees between page load
// and the moment the deploy transaction is sent).
// =====================================================

export async function refreshDeployFee(symbol) {
    const existing = loadedMethods.find(m => m.symbol === symbol);
    const pm = existing ?? await getPaymentMethod(symbol);

    const [deployFee, burnAmount, treasuryAmount] = await getDeployFee(symbol);
    const decimals = existing?.decimals ?? await resolveDecimals(pm);

    const updated = {
        ...(existing ?? { symbol, isNative: pm.isNative, token: pm.token, exchange: pm.exchange, burnEnabled: pm.burnEnabled }),
        decimals,
        fee: deployFee,
        feeFormatted: formatUnits(deployFee, decimals),
        burnAmount,
        treasuryAmount,
        burnAmountFormatted: formatUnits(burnAmount, decimals),
        treasuryAmountFormatted: formatUnits(treasuryAmount, decimals)
    };

    const idx = loadedMethods.findIndex(m => m.symbol === symbol);
    if (idx >= 0) loadedMethods[idx] = updated;
    else loadedMethods.push(updated);

    return updated;
}

// =====================================================
// Selection
// =====================================================

export function selectPayment(symbol) {
    selectedSymbol = symbol;
}

export function getSelectedPayment() {
    if (!selectedSymbol) return null;
    return loadedMethods.find(m => m.symbol === selectedSymbol) ?? null;
}

export function getLoadedMethods() {
    return loadedMethods;
}

// =====================================================
// Render Cards
// =====================================================

export function renderPaymentCards(containerId, onSelect) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!loadedMethods.length) {
        container.innerHTML = `
          <div class="paymentEmpty">
            <p>No payment methods available on this network.<br>
            The admin needs to configure payment methods first.</p>
          </div>`;
        return;
    }

    container.innerHTML = "";

    loadedMethods.forEach(pm => {
        const card = document.createElement("button");
        card.type = "button";
        card.className = "paymentCard";
        card.dataset.symbol = pm.symbol;

        const icon = pm.isNative
          ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M6 12l6-6 6 6"/></svg>`
          : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-4 0v2M12 12v4M10 14h4"/></svg>`;

        const typeBadge = pm.isNative
          ? `<span class="payBadge payBadge--native">Native Coin</span>`
          : `<span class="payBadge payBadge--token">ERC-20</span>`;

        const feeNum = parseFloat(pm.feeFormatted);
        const feeDisplay = feeNum === 0 ? "Free" : `${feeNum % 1 === 0 ? feeNum.toFixed(0) : feeNum.toPrecision(6)} ${pm.symbol}`;

        card.innerHTML = `
          <div class="payCard__icon">${icon}</div>
          <div class="payCard__body">
            <div class="payCard__top">
              <span class="payCard__sym">${pm.symbol}</span>
              ${typeBadge}
            </div>
            <div class="payCard__fee">
              <span class="payCard__feeLabel">Deploy Fee</span>
              <strong class="payCard__feeVal">${feeDisplay}</strong>
            </div>
            ${pm.burnEnabled ? '<div class="payCard__burn">🔥 Burn enabled</div>' : ''}
          </div>
          <div class="payCard__check">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
          </div>`;

        card.addEventListener("click", () => {
            container.querySelectorAll(".paymentCard").forEach(c => c.classList.remove("selected"));
            card.classList.add("selected");
            selectPayment(pm.symbol);
            if (onSelect) onSelect(pm);
        });

        container.appendChild(card);
    });

    // Auto-select first
    if (loadedMethods.length > 0 && !selectedSymbol) {
        const first = container.querySelector(".paymentCard");
        first?.click();
    }
}

// =====================================================
// EIP-712 Permit for ERC-20 payment (LFT)
// =====================================================

export async function signPermit(signer, tokenContract, spender, value, deadline) {
    const owner      = await signer.getAddress();
    const nonce      = await tokenContract.nonces(owner);
    const domain     = {
        name:              await tokenContract.name(),
        version:           "1",
        chainId:           (await signer.provider.getNetwork()).chainId,
        verifyingContract: await tokenContract.getAddress()
    };
    const types = {
        Permit: [
            { name: "owner",    type: "address" },
            { name: "spender",  type: "address" },
            { name: "value",    type: "uint256" },
            { name: "nonce",    type: "uint256" },
            { name: "deadline", type: "uint256" }
        ]
    };
    const message = { owner, spender, value, nonce, deadline };
    const sig     = await signer.signTypedData(domain, types, message);
    const r       = sig.slice(0, 66);
    const s       = "0x" + sig.slice(66, 130);
    const v       = parseInt(sig.slice(130, 132), 16);
    return { v, r, s, deadline };
}

export default {
    loadPaymentMethods,
    refreshDeployFee,
    renderPaymentCards,
    selectPayment,
    getSelectedPayment,
    getLoadedMethods,
    signPermit
};
