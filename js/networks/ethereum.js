const NETWORK = Object.freeze({

    chainId: 1,

    key: "ethereum",

    name: "Ethereum",

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

        token: "./abi/ethereum/LaunchFutureToken.json",

        exchange: "./abi/ethereum/LaunchFutureExchange.json",

        deployer: "./abi/ethereum/LFTDeployer.json",

        factory: "./abi/ethereum/LFTFactory.json"

    })

});

export default NETWORK;
