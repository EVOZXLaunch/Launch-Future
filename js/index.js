// ===================================================== 
// LaunchFuture Main Controller Part 1 
// Foundation 
// =====================================================

import {

    initUI,

    nextStep,

    previousStep,

    goToStep,

    getCurrentStep,

    setWalletConnected,

    setWalletDisconnected,

    initTheme,

    toggleTheme,

    bindModal,

    openModal,

    closeModal,

    showToast,

    updatePreview,

    updateReview,

    updateDeployResult,

    appendConsole,

    setLoading,

    updateDeployTimeline

} from "./ui.js";

import {

    restoreConnection,

    connectWallet,

    disconnectWallet,

    isConnected,

    getAccount,

    getChainId,

    getWalletName,

    getNetwork,

    switchNetwork,

    ensureNetwork

} from "./wallet.js";

import {

    getCurrentNetwork

} from "./networks/index.js";

import {

    getFormattedBalance,

    isAddress

} from "./blockchain.js";

import {

    initDateTime

} from "./datetime.js";

import {

    getWizardData,

    loadWizard,

    saveWizard,

    setTokenData,

    setMetadataData,

    setFeatureData

} from "./wizard.js";

import {

    buildTokenConfig,

    buildValidationConfig,

    buildMetadata,

    deployToken,

    buildVerifyPackage,

    DEPLOY_STATUS,

    getDeployStatus,

    isDeploying

} from "./deploy.js";

import {

    validateTokenConfig

} from "./validation.js";

import {

    isSymbolAvailable,

    getFactory

} from "./factory.js";

import FEATURES from "./features.js";
import { loadPaymentMethods, renderPaymentCards, getSelectedPayment, refreshDeployFee } from "./payment.js";
import { formatUnits } from "https://esm.sh/ethers@6";


// =====================================================
// DOM HELPERS
// =====================================================

const $ = id =>

    document.getElementById(id);

const $$ = selector =>

    [...document.querySelectorAll(selector)];


// =====================================================
// APPLICATION STATE
// =====================================================

const state = {

    step: 1,

    wallet: {

        connected: false,

        address: null

    },

    deployment: {

        fee: null,

        result: null,

        verifyPackage: null

    }

};


// =====================================================
// DOM CACHE
// =====================================================

const dom = {

    // navigation

    backButton:

        $("backButton"),

    nextButton:

        $("nextButton"),

    deployButton:

        $("deployButton"),

    stepCounter:

        $("stepCounter"),

    timeline:

        $$(".timelineStep"),

    wizardSteps:

        $$(".wizardStep"),

    // wallet

    connectWalletButton:

        $("connectWalletButton"),

    walletConnectionStatus:

        $("walletConnectionStatus"),

    walletProviderName:

        $("walletProviderName"),

    walletAddress:

        $("walletAddress"),

    walletNetwork:

        $("walletNetwork"),

    walletBalance:

        $("walletBalance"),

    walletBadge:

        $("walletBadge"),

    // token

    tokenName:

        $("tokenName"),

    tokenSymbol:

        $("tokenSymbol"),

    tokenSupply:

        $("tokenSupply"),

    tokenDecimals:

        $("tokenDecimals"),

    tokenOwner:

        $("tokenOwner"),

    paymentMethod:

        $("paymentMethod"),

    // metadata

    website:

        $("website"),

    telegram:

        $("telegram"),

    twitter:

        $("twitter"),

    // preview

    previewName:

        $("previewName"),

    previewSymbol:

        $("previewSymbol"),

    previewSupply:

        $("previewSupply"),

    previewDecimals:

        $("previewDecimals"),

    previewOwner:

        $("previewOwner"),

    previewFee:

        $("previewFee"),

    previewFeatures:

        $("previewFeatures"),

    // review

    reviewName:

        $("reviewName"),

    reviewSymbol:

        $("reviewSymbol"),

    reviewSupply:

        $("reviewSupply"),

    reviewDecimals:

        $("reviewDecimals"),

    reviewOwner:

        $("reviewOwner"),

    reviewNetwork:

        $("reviewNetwork"),

    // deploy

    deployConsole:

        $("deployConsoleOutput"),

    contractAddress:

        $("contractAddress"),

    transactionHash:

        $("transactionHash"),

    blockNumber:

        $("blockNumber")

};


// =====================================================
// SAFE SETTERS
// =====================================================

function setText(

    element,

    value = "-"

){

    if(

        element

    ){

        element.textContent =

            value;

    }

}

function setHTML(

    element,

    value = ""

){

    if(

        element

    ){

        element.innerHTML =

            value;

    }

}


// =====================================================
// INITIALIZE
// =====================================================

document.addEventListener(

    "DOMContentLoaded",

    initialize

);

async function initialize(){

    try{

        initUI();

        initTheme();

        bindModal();

        initDateTime();

        loadWizard();

        cacheFeatureInputs();

        bindEvents();

        await initializeWallet();

    }

    catch(error){

        console.error(error);

alert(error.stack);

    }

}


// =====================================================
// FEATURE CACHE
// =====================================================

const featureInputs = {};

function cacheFeatureInputs(){

    FEATURES.forEach(

        feature=>{

            featureInputs[

                feature.id

            ] =

                $(feature.id);

        }

    );

}


// =====================================================
// WALLET
// =====================================================

async function initializeWallet(){

    await restoreConnection();

    if(

        isConnected()

    ){

        state.wallet.connected =

            true;

        state.wallet.address =

            getAccount();

        let balance = "0";
        try {
            balance = await getFormattedBalance(state.wallet.address);
        } catch (balErr) {
            console.warn("Balance fetch failed:", balErr);
        }

        setWalletConnected({

    address:

        state.wallet.address,

    provider:

        getWalletName() || "EVM Wallet",

    network:

        getNetwork()?.name || "-",

    balance

});

    }

    else{

        state.wallet.connected =

            false;

        state.wallet.address =

            null;

        setWalletDisconnected();

    }

}

// =====================================================
// EVENTS
// =====================================================

function bindEvents() {

    dom.nextButton?.addEventListener(

        "click",

        handleNextStep

    );

    dom.backButton?.addEventListener(

        "click",

        handlePreviousStep

    );

    dom.connectWalletButton?.addEventListener(

        "click",

        handleConnectWallet

    );

    $("stepConnectWalletButton")?.addEventListener(

        "click",

        handleConnectWallet

    );

    $("themeButton")?.addEventListener(

        "click",

        toggleTheme

    );

    $("feeCalculatorButton")?.addEventListener(

        "click",

        openFeeCalculator

    );

    dom.deployButton?.addEventListener(

        "click",

        handleDeploy

    );

    ["confirmInformation", "confirmOwnership", "confirmIrreversible"].forEach(id => {
        $(id)?.addEventListener("change", refreshPreviewAndReview);
    });

    dom.timeline.forEach(

        button => {

            button.addEventListener(

                "click",

                () => {

                    handleGoToStep(

                        Number(

                            button.dataset.step

                        )

                    );

                }

            );

        }

    );

}


// =====================================================
// STEP NAVIGATION (wrapped so we can react to step changes)
// =====================================================

async function handleNextStep() {
    const leavingStep = getCurrentStep();
    collectWizardData();

    if (leavingStep === 2) {
        const ok = await validateStep2();
        if (!ok) return;
    }

    if (leavingStep === 5 && !allConfirmationsChecked()) {
        showToast({
            title: "Please confirm",
            message: "Check all three boxes before proceeding to deployment.",
            variant: "error"
        });
        return;
    }

    nextStep();
    onStepChange(getCurrentStep());
}

function handlePreviousStep() {
    previousStep();
    onStepChange(getCurrentStep());
}

function handleGoToStep(step) {
    collectWizardData();
    goToStep(step);
    onStepChange(getCurrentStep());
}

function onStepChange(step) {
    // Step 2 = "ERC20MAX Configuration", where payment methods & fees are shown
    if (step === 2) {
        initPaymentMethods();
        // Default owner to the connected wallet if the user hasn't set one yet
        if (dom.tokenOwner && !dom.tokenOwner.value.trim() && state.wallet.address) {
            dom.tokenOwner.value = state.wallet.address;
        }
    }

    if (step === 5) {
        collectWizardData();
        refreshGasEstimate();
    }

    refreshPreviewAndReview();
}


// =====================================================
// WIZARD DATA COLLECTION
// =====================================================

function readFeatureCheckboxes() {
    return {
        mintable:          Boolean($("featureMintable")?.checked),
        burnable:           Boolean($("featureBurnable")?.checked),
        // "Trading Enable" has no dedicated field in the on-chain
        // SecurityConfig struct — it's kept here for the feature-count
        // display only and is not sent to the contract.
        tradingEnable:      Boolean($("featureTrading")?.checked),
        tradingDelay:       Boolean($("featureTradingDelay")?.checked),
        antiBot:            Boolean($("featureAntiBot")?.checked),
        blacklist:          Boolean($("featureBlacklist")?.checked),
        whitelist:          Boolean($("featureWhitelist")?.checked),
        maxWalletEnabled:   Boolean($("featureMaxWallet")?.checked),
        maxTxEnabled:       Boolean($("featureMaxTx")?.checked)
    };
}

function collectWizardData() {
    const name    = dom.tokenName?.value?.trim() || "";
    const symbol  = (dom.tokenSymbol?.value || "").trim().toUpperCase();
    const supply  = dom.tokenSupply?.value?.trim() || "";
    const decimals = Number(dom.tokenDecimals?.value || 18);
    let owner     = (dom.tokenOwner?.value || "").trim();
    if (!owner && state.wallet.address) owner = state.wallet.address;

    setTokenData({ name, symbol, supply, decimals, owner });
    setFeatureData(readFeatureCheckboxes());
    setMetadataData({
        website:            dom.website?.value?.trim() || "",
        telegram:           dom.telegram?.value?.trim() || "",
        twitter:            dom.twitter?.value?.trim() || "",
        whitepaper:         $("whitepaper")?.value?.trim() || "",
        discord:            $("discord")?.value?.trim() || "",
        github:             $("github")?.value?.trim() || "",
        projectDescription: $("projectDescription")?.value?.trim() || ""
    });

    return getWizardData();
}

function allConfirmationsChecked() {
    return Boolean(
        $("confirmInformation")?.checked &&
        $("confirmOwnership")?.checked &&
        $("confirmIrreversible")?.checked
    );
}

async function validateStep2() {
    const data = getWizardData();
    const flat = buildValidationConfig({ ...data.token, features: data.features });
    const validation = await validateTokenConfig(flat);

    if (!validation.valid) {
        showToast({
            title: "Fix configuration",
            message: validation.errors[0]?.message || "Invalid token configuration.",
            variant: "error"
        });
        return false;
    }

    try {
        const available = await isSymbolAvailable(flat.symbol);
        if (!available) {
            showToast({
                title: "Symbol taken",
                message: `"${flat.symbol}" is already registered on this network. Choose another symbol.`,
                variant: "error"
            });
            return false;
        }
    } catch (err) {
        // Don't block progress if the availability check itself fails
        // (e.g. RPC hiccup) — the contract still enforces uniqueness at
        // deploy time either way.
        console.warn("Symbol availability check failed:", err);
    }

    return true;
}

function formatFeeForDisplay(pm) {
    if (!pm) return "Select a payment method";
    const feeNum = parseFloat(pm.feeFormatted);
    if (feeNum === 0) return "Free";
    return `${feeNum % 1 === 0 ? feeNum.toFixed(0) : feeNum.toPrecision(6)} ${pm.symbol}`;
}

function refreshPreviewAndReview() {
    const data = getWizardData();
    const enabledCount = Object.values(data.features || {}).filter(Boolean).length;

    // Reuse whatever payment method is already selected instead of
    // wiping the preview back to "Loading..." every time the user
    // navigates between steps — that's what made the Live Preview
    // panel look out of sync with what was actually chosen.
    const selectedPayment = getSelectedPayment();

    updatePreview({
        name:     data.token.name || "Token Name",
        symbol:   data.token.symbol || "SYMBOL",
        owner:    data.token.owner || "-",
        supply:   data.token.supply || "-",
        decimals: data.token.decimals || 18,
        features: enabledCount,
        fee:      formatFeeForDisplay(selectedPayment),
        gas:      lastGasEstimate ?? "Calculated at deploy"
    });

    updateReview({
        name:     data.token.name,
        symbol:   data.token.symbol,
        supply:   data.token.supply,
        decimals: data.token.decimals,
        owner:    data.token.owner
    });
}

// =====================================================
// GAS ESTIMATE
// =====================================================
// Best-effort estimate shown in the Live Preview panel. Deliberately
// non-fatal: if estimation fails (e.g. RPC doesn't support eth_estimateGas
// simulation for a pending config, or wallet not connected yet) we just
// fall back to an honest label instead of a fake number.

let lastGasEstimate = null;

async function refreshGasEstimate() {
    const feEl = document.getElementById("previewGas");
    if (!feEl) return;

    if (!isConnected()) {
        lastGasEstimate = "Connect wallet to estimate";
        feEl.textContent = lastGasEstimate;
        return;
    }

    const payment = getSelectedPayment();
    if (!payment) {
        lastGasEstimate = "Select a payment method";
        feEl.textContent = lastGasEstimate;
        return;
    }

    try {
        feEl.textContent = "Estimating...";

        const data = getWizardData();
        const flat = buildValidationConfig({ ...data.token, features: data.features });
        const validation = await validateTokenConfig(flat);
        if (!validation.valid) {
            lastGasEstimate = "Complete configuration to estimate";
            feEl.textContent = lastGasEstimate;
            return;
        }

        const config = buildTokenConfig({
            ...data.token,
            features: data.features,
            owner: data.token.owner || state.wallet.address
        });
        const metadata = buildMetadata(data.metadata || {});

        const factory = await getFactory();

        let gas;
        if (payment.isNative) {
            gas = await factory.deployWithNative.estimateGas(config, metadata, { value: payment.fee });
        } else {
            // Permit-based payment requires a live signature to simulate
            // accurately, so we don't attempt a synthetic estimate here —
            // showing an honest label beats a misleading fabricated number.
            lastGasEstimate = "Estimated at signature step";
            feEl.textContent = lastGasEstimate;
            return;
        }

        const withBuffer = (gas * 120n) / 100n; // +20% safety margin, matches GAS.multiplier
        lastGasEstimate = `~${withBuffer.toString()} gas`;
        feEl.textContent = lastGasEstimate;

    } catch (err) {
        console.warn("Gas estimate failed:", err?.shortMessage || err?.message || err);
        lastGasEstimate = "Unavailable — check configuration";
        feEl.textContent = lastGasEstimate;
    }
}


// Asks the wallet to switch (or add-then-switch) to the app's target
// network. Returns true on success, false if the user rejected it or it
// otherwise failed — callers decide how to react to a "no".
async function promptNetworkSwitch(target) {
    try {
        await ensureNetwork(target);

        showToast({
            title: "Network switched",
            message: `Connected to ${target.name}.`,
            variant: "success"
        });

        if (getCurrentStep() === 2) {
            initPaymentMethods();
        }

        return true;
    } catch (err) {
        console.warn("Network switch failed:", err?.message || err);
        return false;
    }
}

// =====================================================
// WALLET CONNECT (button click handler)
// =====================================================

async function handleConnectWallet() {

    try {

        const result = await connectWallet();

        state.wallet.connected = true;
        state.wallet.address = result.account;

        const target = getCurrentNetwork();
        if (Number(result.chainId) !== Number(target.chainId)) {
            const switched = await promptNetworkSwitch(target);
            if (!switched) {
                showToast({
                    title: "Wrong network",
                    message: `Your wallet is not on ${target.name}. Switch networks to see live fees and deploy.`,
                    variant: "error"
                });
            }
        }

        let balance = "0";
        try {
            balance = await getFormattedBalance(result.account);
        } catch (balErr) {
            console.warn("Balance fetch failed:", balErr);
        }

        setWalletConnected({
            address: result.account,
            provider: result.walletName || getWalletName() || "EVM Wallet",
            network: result.network?.name || getNetwork()?.name || "-",
            balance
        });

        showToast({
            title: "Wallet connected",
            message: `Connected as ${result.account}`,
            variant: "success"
        });

        // If we're already on the payment-methods step, refresh them
        // now that we have a signer.
        if (getCurrentStep() === 2) {
            initPaymentMethods();
        }

    } catch (err) {

        console.error("Wallet connect error:", err);

        showToast({
            title: "Connection failed",
            message: err?.message || "Could not connect wallet. Make sure you have an EVM wallet installed.",
            variant: "error"
        });
    }
}


// =====================================================
// PAYMENT METHODS
// =====================================================

async function initPaymentMethods() {

    const cards = document.getElementById("paymentCards");
    if (cards) {
        cards.innerHTML = `
          <div class="paymentLoading">
            <svg class="spinnerIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" stroke-opacity=".25"/>
              <path d="M12 2a10 10 0 0 1 10 10"/>
            </svg>
            <span>Loading payment methods from contract...</span>
          </div>`;
    }

    try {
        await loadPaymentMethods();
        renderPaymentCards("paymentCards", (pm) => {
            // Update hint
            const hint = document.getElementById("paymentHint");
            if (hint) {
                if (pm.isNative) {
                    hint.textContent = `Pay ${pm.feeFormatted} ${pm.symbol} native coin directly from your wallet.`;
                } else {
                    hint.textContent = `Pay with ${pm.symbol} ERC-20 token. A gasless EIP-712 permit signature will be requested.`;
                }
            }
            // Update preview fee
            const feeEl = document.getElementById("previewFee");
            if (feeEl) {
                feeEl.textContent = formatFeeForDisplay(pm);
            }
            refreshGasEstimate();
        });

        // Auto-select fires synchronously inside renderPaymentCards, so by
        // the time we get here a payment method is already selected —
        // kick off the first gas estimate right away instead of waiting
        // for the user to click a card.
        refreshGasEstimate();
    } catch (err) {
        if (cards) {
            cards.innerHTML = '<div class="paymentEmpty"><p>Could not load payment methods.<br>Make sure your wallet is connected and you are on the right network.</p></div>';
        }
        console.error("Payment init error:", err);
    }
}


// =====================================================
// DEPLOY
// =====================================================

const DEPLOY_TIMELINE_INDEX = {
    [DEPLOY_STATUS.CONNECTING]:     0,
    [DEPLOY_STATUS.VALIDATING]:     0,
    [DEPLOY_STATUS.SIGNING_PERMIT]: 1,
    [DEPLOY_STATUS.WAIT_SIGNATURE]: 1,
    [DEPLOY_STATUS.PENDING]:        2
};

async function handleDeploy() {

    if (isDeploying()) return;

    const data = collectWizardData();
    const flat = buildValidationConfig({ ...data.token, features: data.features });

    const validation = await validateTokenConfig(flat);
    if (!validation.valid) {
        showToast({
            title: "Cannot deploy",
            message: validation.errors[0]?.message || "Invalid token configuration.",
            variant: "error"
        });
        handleGoToStep(2);
        return;
    }

    if (!allConfirmationsChecked()) {
        showToast({
            title: "Please confirm",
            message: "Check all three confirmation boxes on the Review step first.",
            variant: "error"
        });
        handleGoToStep(5);
        return;
    }

    const payment = getSelectedPayment();
    if (!payment) {
        showToast({
            title: "No payment method",
            message: "Select a payment method on the Configuration step.",
            variant: "error"
        });
        handleGoToStep(2);
        return;
    }

    // A wallet sitting on the wrong chain is the #1 cause of confusing
    // "missing revert data" / CALL_EXCEPTION errors from estimateGas —
    // the factory address on that chain either doesn't exist or is a
    // different contract entirely. Catch it here with a clear message
    // instead of letting the raw RPC error reach the user.
    const target = getCurrentNetwork();
    if (isConnected() && Number(getChainId()) !== Number(target.chainId)) {
        const switched = await promptNetworkSwitch(target);
        if (!switched) {
            showToast({
                title: "Wrong network",
                message: `Switch your wallet to ${target.name} before deploying.`,
                variant: "error"
            });
            return;
        }
    }

    const config   = buildTokenConfig({ ...data.token, features: data.features });
    const metadata = buildMetadata(data.metadata);

    if (dom.deployButton) dom.deployButton.disabled = true;
    setLoading(true, "Preparing deployment...");

    if (dom.deployConsole) dom.deployConsole.textContent = "";
    appendConsole(`> Deploying ${flat.symbol} (${flat.name})...`);
    appendConsole(`> Paying with ${payment.symbol}`);
    updateDeployTimeline(0);

    let lastLogged = null;
    const poll = setInterval(() => {
        const status = getDeployStatus();
        if (status === lastLogged) return;
        lastLogged = status;

        appendConsole(`> ${status.replaceAll("_", " ")}`);

        if (status in DEPLOY_TIMELINE_INDEX) {
            updateDeployTimeline(DEPLOY_TIMELINE_INDEX[status]);
        }
        if (status === DEPLOY_STATUS.WAIT_SIGNATURE) {
            setLoading(true, "Waiting for wallet confirmation...");
        } else if (status === DEPLOY_STATUS.SIGNING_PERMIT) {
            setLoading(true, "Requesting permit signature...");
        }
    }, 200);

    try {

        const result = await deployToken(config, metadata);

        clearInterval(poll);
        updateDeployTimeline(3);
        setLoading(false);

        appendConsole(`> Success — token deployed${result.tokenAddress ? ` at ${result.tokenAddress}` : ""}`);
        appendConsole(`> Transaction: ${result.txHash}`);

        updateDeployResult({
            contractAddress: result.tokenAddress || "-",
            transactionHash: result.txHash,
            blockNumber:     result.blockNumber
        });

        const resultCard = $("deployResult");
        if (resultCard) resultCard.hidden = false;

        showToast({
            title: "Token deployed",
            message: `${flat.symbol} was deployed successfully.`,
            variant: "success"
        });

    } catch (err) {

        clearInterval(poll);
        setLoading(false);

        const status = getDeployStatus();
        const failedIndex = DEPLOY_TIMELINE_INDEX[status] ?? 0;
        updateDeployTimeline(failedIndex, failedIndex);

        appendConsole(`> Error: ${err?.message || "Deployment failed."}`);

        showToast({
            title: "Deploy failed",
            message: err?.message || "Something went wrong during deployment.",
            variant: "error"
        });

        console.error("Deploy error:", err);

        if (dom.deployButton) dom.deployButton.disabled = false;
    }
}


// =====================================================
// FEE CALCULATOR
// =====================================================

async function openFeeCalculator() {

    openModal({
        title: "Fee Calculator",
        bodyHTML: `
          <p class="feeCalcIntro">Live deploy fees pulled directly from the factory contract on EVOZ Mainnet. Pick any option during checkout — fees below already include the current on-chain rate.</p>
          <div class="feeCalcLoading">
            <svg class="spinnerIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" stroke-opacity=".25"/>
              <path d="M12 2a10 10 0 0 1 10 10"/>
            </svg>
            <span>Fetching current fees...</span>
          </div>`,
        showFooter: false
    });

    try {

        // Always re-read straight from the contract on every open, never
        // reuse whatever was cached from a previous step. An admin can
        // change fees at any time, and this is the one place users go
        // specifically to check the *current* on-chain rate.
        const methods = await loadPaymentMethods();

        const body = document.getElementById("modalBody");
        if (!body) return;

        if (!methods.length) {
            body.innerHTML = `
              <p class="feeCalcIntro">Live deploy fees pulled directly from the factory contract on EVOZ Mainnet.</p>
              <div class="feeCalcEmpty">No payment methods are configured on this network yet.</div>`;
            return;
        }

        const rows = methods.map(pm => {
            const feeNum = parseFloat(pm.feeFormatted);
            const feeDisplay = feeNum === 0
                ? "Free"
                : `${feeNum % 1 === 0 ? feeNum.toFixed(0) : feeNum.toPrecision(6)} ${pm.symbol}`;
            const badge = pm.isNative ? "Native Coin" : "ERC-20";
            return `
              <div class="feeCalcRow">
                <span class="feeCalcRow__symbol">${pm.symbol} <span class="feeCalcRow__badge">${badge}</span></span>
                <span class="feeCalcRow__value">${feeDisplay}</span>
              </div>`;
        }).join("");

        body.innerHTML = `
          <p class="feeCalcIntro">Live deploy fees pulled directly from the factory contract on EVOZ Mainnet. Pick any option during checkout.</p>
          <div class="feeCalcList">${rows}</div>`;

        if (window.lucide) lucide.createIcons();

    } catch (err) {

        console.error("Fee calculator error:", err);

        const body = document.getElementById("modalBody");
        if (body) {
            body.innerHTML = `<div class="feeCalcError">Could not fetch fees. Make sure your wallet is connected and you are on the right network.</div>`;
        }
    }
}

