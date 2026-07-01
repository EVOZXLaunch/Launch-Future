// =====================================================
// Storage
// =====================================================

const STORAGE_KEY =
    "launchfuture.network";

// =====================================================
// LaunchFuture
// Network Manager
// =====================================================

import EVOZ from "./evoz.js";
import ETHEREUM from "./ethereum.js";
import BSC from "./bsc.js";
import POLYGON from "./polygon.js";
import ARBITRUM from "./arbitrum.js";
import BASE from "./base.js";

// =====================================================
// Networks
// =====================================================

const NETWORKS = Object.freeze({

    [EVOZ.key]: EVOZ,

    [ETHEREUM.key]: ETHEREUM,

    [BSC.key]: BSC,

    [POLYGON.key]: POLYGON,

    [ARBITRUM.key]: ARBITRUM,

    [BASE.key]: BASE

});

// =====================================================
// Current Network
// =====================================================

let currentNetwork =
    EVOZ;

const savedNetwork =

    localStorage.getItem(
        STORAGE_KEY
    );

if (

    savedNetwork &&
    NETWORKS[savedNetwork]

) {

    currentNetwork =
        NETWORKS[savedNetwork];

}

// =====================================================
// Get
// =====================================================

export function getCurrentNetwork() {

    return currentNetwork;

}

export function getNetwork(key) {

    return NETWORKS[key] ?? null;

}

export function getSupportedNetworks() {

    return Object.values(
        NETWORKS
    );

}

// =====================================================
// Set
// =====================================================

export function setCurrentNetwork(
    key
) {

    const network =
        getNetwork(key);

    if (!network) {

        throw new Error(

            `Unsupported network: ${key}`

        );

    }

    currentNetwork =
        network;

    localStorage.setItem(

        STORAGE_KEY,

        key

    );

    return currentNetwork;

}

// =====================================================
// Chain ID
// =====================================================

export function getNetworkByChainId(
    chainId
) {

    return (

        Object
            .values(NETWORKS)

            .find(

                network =>

                    Number(
                        network.chainId
                    ) ===
                    Number(
                        chainId
                    )

            )

        ?? null

    );

}

// =====================================================
// Export
// =====================================================

export default NETWORKS;
