const NETWORK = Object.freeze({

    chainId: 42161,

    key: "arbitrum",

    name: "arbitrum",

    symbol: "ETH",

    decimals: 18,

    status: "coming_soon",

    contracts: Object.freeze({

        token: "",

        exchange: "",

        deployer: "",

        factory: ""

    }),

    abi: Object.freeze({

        token: "./abi/arbitrum/LaunchFutureToken.json",

        exchange: "./abi/arbitrum/LaunchFutureExchange.json",

        deployer: "./abi/arbitrum/LFTDeployer.json",

        factory: "./abi/arbitrum/LFTFactory.json"

    })

});

export default NETWORK;
