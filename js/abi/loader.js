// =====================================================
// LaunchFuture
// ABI Loader
// =====================================================

import {
    
    getCurrentNetwork

} from "../networks/index.js";

// =====================================================
// Cache
// =====================================================

const cache =
    new Map();

// =====================================================
// Load ABI
// =====================================================

export async function loadABI(
    contractName
) {

    const network =
        getCurrentNetwork();

    const cacheKey =

        `${network.key}:${contractName}`;

    if (

        cache.has(
            cacheKey
        )

    ) {

        return cache.get(
            cacheKey
        );
        
    }

    const response =
        await fetch(

            `./abi/${network.key}/${contractName}.json`

        );

    if (

        !response.ok

    ) {

        throw new Error(

            `Unable to load ABI: ${contractName}`

        );

    }

    const abi =
        await response.json();

    cache.set(

        cacheKey,

        abi

    );

    return abi;

}

// =====================================================
// Cache
// =====================================================

export function clearABICache() {

    cache.clear();

}

export function hasABI(
    contractName
) {

    const network =
        getCurrentNetwork();

    return cache.has(

        `${network.key}:${contractName}`

    );

}
