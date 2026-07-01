// =====================================================
// LaunchFuture
// Polygon Network Configuration
// Status: coming_soon — LaunchFuture's factory contracts have not
// been deployed on this chain yet. Fill in `contracts` below and
// flip `status` to "live" once they are, drop the compiled ABIs into
// /abi/polygon, and it lights up automatically in the network
// switcher — no other code changes needed.
// =====================================================

import { createNetworkHelpers } from "./_helpers.js";

const NETWORK = Object.freeze({

    // -------------------------------------------------
    // Basic Information
    // -------------------------------------------------

    chainId: 137,

    key: "polygon",

    name: "Polygon",

    symbol: "POL",

    decimals: 18,

    status: "coming_soon",

    // -------------------------------------------------
    // Native Currency
    // -------------------------------------------------

    currency: Object.freeze({

        name: "POL",

        symbol: "POL",

        decimals: 18

    }),

    // -------------------------------------------------
    // RPC
    // -------------------------------------------------

    rpc: Object.freeze([

        "https://polygon-rpc.com",

        "https://polygon-bor-rpc.publicnode.com"

    ]),

    // -------------------------------------------------
    // Explorer
    // -------------------------------------------------

    explorer: Object.freeze({

        name: "PolygonScan",

        url: "https://polygonscan.com"

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

        token: "./abi/polygon/LaunchFutureToken.json",

        exchange: "./abi/polygon/LaunchFutureExchange.json",

        deployer: "./abi/polygon/LFTDeployer.json",

        factory: "./abi/polygon/LFTFactory.json"

    }),

    // -------------------------------------------------
    // Payment Symbols (shown as fee options on deploy)
    // Add more as you register them in the factory
    // -------------------------------------------------

    paymentSymbols: ["POL"]

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
