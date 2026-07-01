// =====================================================
// LaunchFuture
// Arbitrum One Network Configuration
// Status: coming_soon — LaunchFuture's factory contracts have not
// been deployed on this chain yet. Fill in `contracts` below and
// flip `status` to "live" once they are, drop the compiled ABIs into
// /abi/arbitrum, and it lights up automatically in the network
// switcher — no other code changes needed.
// =====================================================

import { createNetworkHelpers } from "./_helpers.js";

const NETWORK = Object.freeze({

    // -------------------------------------------------
    // Basic Information
    // -------------------------------------------------

    chainId: 42161,

    key: "arbitrum",

    name: "Arbitrum One",

    symbol: "ETH",

    decimals: 18,

    status: "coming_soon",

    // -------------------------------------------------
    // Native Currency
    // -------------------------------------------------

    currency: Object.freeze({

        name: "Ether",

        symbol: "ETH",

        decimals: 18

    }),

    // -------------------------------------------------
    // RPC
    // -------------------------------------------------

    rpc: Object.freeze([

        "https://arb1.arbitrum.io/rpc"

    ]),

    // -------------------------------------------------
    // Explorer
    // -------------------------------------------------

    explorer: Object.freeze({

        name: "Arbiscan",

        url: "https://arbiscan.io"

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

        token: "./abi/arbitrum/LaunchFutureToken.json",

        exchange: "./abi/arbitrum/LaunchFutureExchange.json",

        deployer: "./abi/arbitrum/LFTDeployer.json",

        factory: "./abi/arbitrum/LFTFactory.json"

    }),

    // -------------------------------------------------
    // Payment Symbols (shown as fee options on deploy)
    // Add more as you register them in the factory
    // -------------------------------------------------

    paymentSymbols: ["ETH"]

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
