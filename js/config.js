// =====================================================
// Launch Future
// Global Configuration
// =====================================================

export const APP = Object.freeze({

    name:
        "LaunchFuture",

    version:
        "1.0.0",

    description:
        "Decentralized Multi-Chain Token Launch Platform",

    author:
        "LaunchFuture",

    website:
        "",

    github:
        ""

});

// =====================================================
// Config Version
// =====================================================

export const CONFIG_VERSION =

    "1.0.0";

// =====================================================
// Cache
// =====================================================

export const CACHE = Object.freeze({

    wallet:
        "lf_wallet",

    wizard:
        "lf_wizard",

    network:
        "lf_network",

    settings:
        "lf_settings",

    deployHistory:
        "lf_history"

});

// =====================================================
// Feature Flags
// =====================================================

export const FEATURE_FLAGS = Object.freeze({

    verification:
        true,

    metadata:
        true,

    deployHistory:
        true,

    analytics:
        false,

    debug:
        false

});

// =====================================================
// Wallet
// =====================================================

export const WALLET = Object.freeze({

    autoConnect:
        true,

    autoSwitchNetwork:
        true,

    reconnect:
        true

});

// =====================================================
// RPC
// =====================================================

export const RPC = Object.freeze({

    timeout:
        15000,

    retries:
        3,

    retryDelay:
        1000,

    cacheTTL:
        30000

});

// =====================================================
// Deploy
// =====================================================

export const DEPLOY = Object.freeze({

    confirmations:
        1,

    gasMultiplier:
        1.20

});

// =====================================================
// Gas
// =====================================================

export const GAS = Object.freeze({

    multiplier:
        1.20,

    maxMultiplier:
        2.00,

    estimate:
        true,

    eip1559:
        true

});

// =====================================================
// Security
// =====================================================

export const SECURITY = Object.freeze({

    verifyChain:
        true,

    verifyContract:
        true,

    verifyFactory:
        true,

    strictAddress:
        true,

    requireChecksum:
        false

});

// =====================================================
// UI
// =====================================================

export const UI = Object.freeze({

    animation:

        true,

    toastDuration:

        5000,

    loadingDelay:

        250

});

// =====================================================
// Validation
// =====================================================

export const LIMITS = Object.freeze({

    minNameLength:
        2,

    maxNameLength:
        64,

    minSymbolLength:
        2,

    maxSymbolLength:
        12,

    maxWebsiteLength:
        256,

    maxSocialLength:
        256

});

// =====================================================
// Export
// =====================================================

export default {

    APP,

    CONFIG_VERSION,

    CACHE,

    FEATURE_FLAGS,

    WALLET,

    RPC,

    DEPLOY,

    GAS,

    SECURITY,

    UI,

    LIMITS

};
