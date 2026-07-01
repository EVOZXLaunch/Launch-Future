const NETWORK = Object.freeze({

    chainId: 137,

    key: "polygon",

    name: "polygon",

    symbol: "POL",

    decimals: 18,

    status: "coming_soon",

    contracts: Object.freeze({

        token: "",

        exchange: "",

        deployer: "",

        factory: ""

    }),

    abi: Object.freeze({

        token: "./abi/polygon/LaunchFutureToken.json",

        exchange: "./abi/polygon/LaunchFutureExchange.json",

        deployer: "./abi/polygon/LFTDeployer.json",

        factory: "./abi/polygon/LFTFactory.json"

    })

});

export default NETWORK;
