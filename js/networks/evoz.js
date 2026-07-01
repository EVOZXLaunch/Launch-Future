// =====================================================
// LaunchFuture
// EVOZ Mainnet Network Configuration
// =====================================================

const NETWORK = Object.freeze({

    // -------------------------------------------------
    // Basic Information
    // -------------------------------------------------

    chainId: 805,

    key: "evoz",

    name: "EVOZ Mainnet",

    symbol: "EVOZ",

    decimals: 18,

    status: "live",

    // -------------------------------------------------
    // Native Currency
    // -------------------------------------------------

    currency: Object.freeze({

        name: "EVOZ",

        symbol: "EVOZ",

        decimals: 18

    }),

    // -------------------------------------------------
    // RPC
    // -------------------------------------------------

    rpc: Object.freeze([

        "https://rpc.evozscan.com"
        
    ]),

    // -------------------------------------------------
    // Explorer
    // -------------------------------------------------

    explorer: Object.freeze({

        name: "EvozMainnet",

        url: "https://evozscan.com"

    }),

    // -------------------------------------------------
    // Treasury
    // -------------------------------------------------

    treasury:
        "0x50Cd30Ff7f0fbBD9d0FDe1F60DE8c52D6F390c5C",

    // -------------------------------------------------
    // Contracts
    // -------------------------------------------------

    contracts: Object.freeze({

        token:
            "0x62B9559F193d111aF92d9a5604d79024BFB1C847",

        exchange:
            "0x9680B43F695d5245062e59CCA92ad92DE5aed56e",

        deployer:
            "0x3f81E785628D452A8Aae1536D15A3586B490F0c5",

        factory:
            "0xcd86Ca358283f06581365635372E5bF0D30271D3"

    }),

    // -------------------------------------------------
    // ABI Location
    // -------------------------------------------------

    abi: Object.freeze({

        token:
            "./abi/evoz/LaunchFutureToken.json",

        exchange:
            "./abi/evoz/LaunchFutureExchange.json",

        deployer:
            "./abi/evoz/LFTDeployer.json",

        factory:
            "./abi/evoz/LFTFactory.json"

    }),

    // -------------------------------------------------
    // Payment Symbols (shown as fee options on deploy)
    // Add more as you register them in the factory
    // -------------------------------------------------

    paymentSymbols: ["EVOZ", "LFT"]

});

// =====================================================
// Helpers
// =====================================================

export function getChainId() {

    return NETWORK.chainId;

}

export function getRpcUrl() {

    return NETWORK.rpc[0];

}

export function getExplorerUrl() {

    return NETWORK.explorer.url;

}

export function getFactoryAddress() {

    return NETWORK.contracts.factory;

}

export function getDeployerAddress() {

    return NETWORK.contracts.deployer;

}

export function getExchangeAddress() {

    return NETWORK.contracts.exchange;

}

export function getTokenAddress() {

    return NETWORK.contracts.token;

}

export function getTreasuryAddress() {

    return NETWORK.treasury;

}

export function getAbiPath(name) {

    return NETWORK.abi[name] ?? null;

}

// =====================================================
// Export
// =====================================================

export default NETWORK;
