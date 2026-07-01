const NETWORK = Object.freeze({

    chainId: 8453,

    key: "base",

    name: "baseMainnet",

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

        token: "./abi/base/LaunchFutureToken.json",

        exchange: "./abi/base/LaunchFutureExchange.json",

        deployer: "./abi/base/LFTDeployer.json",

        factory: "./abi/base/LFTFactory.json"

    })

});

export default NETWORK;
