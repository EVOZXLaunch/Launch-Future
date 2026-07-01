// =====================================================
// LaunchFuture
// BNB Smart Chain Network Configuration
// Status: coming_soon — LaunchFuture's factory contracts have not
// been deployed on this chain yet. Fill in `contracts` below and
// flip `status` to "live" once they are, drop the compiled ABIs into
// /abi/bsc, and it lights up automatically in the network switcher —
// no other code changes needed.
// =====================================================

import { createNetworkHelpers } from "./_helpers.js";

const NETWORK = Object.freeze({

    // -------------------------------------------------
    // Basic Information
    // -------------------------------------------------

    chainId: 56,

    key: "bsc",

    name: "BNB Smart Chain",

    symbol: "BNB",

    decimals: 18,

    status: "coming_soon",

    // -------------------------------------------------
    // Native Currency
    // -------------------------------------------------

    currency: Object.freeze({

        name: "BNB",

        symbol: "BNB",

        decimals: 18

    }),

    // -------------------------------------------------
    // RPC
    // -------------------------------------------------

    rpc: Object.freeze([

        "https://bsc-dataseed.binance.org",

        "https://bsc-dataseed1.defibit.io"

    ]),

    // -------------------------------------------------
    // Explorer
    // -------------------------------------------------

    explorer: Object.freeze({

        name: "BscScan",

        url: "https://bscscan.com"

    }),

    // -------------------------------------------------
    // Treasury
    // -------------------------------------------------

    treasury: "",

    // -------------------------------------------------
    // Contracts (not deployed yet)
    // -------------------------------------------------

    contracts: Object.freeze({

        token: "",

        exchange: "",

        deployer: "",

        factory: ""

    }),

    // -------------------------------------------------
    // ABI Location
    // -------------------------------------------------

    abi: Object.freeze({

        token: "./abi/bsc/LaunchFutureToken.json",

        exchange: "./abi/bsc/LaunchFutureExchange.json",

        deployer: "./abi/bsc/LFTDeployer.json",

        factory: "./abi/bsc/LFTFactory.json"

    }),

    // -------------------------------------------------
    // Payment Symbols (shown as fee options on deploy)
    // Add more as you register them in the factory
    // -------------------------------------------------

    paymentSymbols: ["BNB"]

});

// =====================================================
// Helpers
// =====================================================

const helpers = createNetworkHelpers(NETWORK);

export const getChainId          = helpers.getChainId;
export const getRpcUrl           = helpers.getRpcUrl;
export const getExplorerUrl      = helpers.getExplorerUrl;
export const getFactoryAddress   = helpers.getFactoryAddress;
export const getDeployerAddress  = helpers.getDeployerAddress;
export const getExchangeAddress  = helpers.getExchangeAddress;
export const getTokenAddress     = helpers.getTokenAddress;
export const getTreasuryAddress  = helpers.getTreasuryAddress;
export const getAbiPath          = helpers.getAbiPath;
export const isLive              = helpers.isLive;

// =====================================================
// Export
// =====================================================

export default NETWORK;
