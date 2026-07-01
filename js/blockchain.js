// =====================================================
// LaunchFuture
// Blockchain Engine
// =====================================================

import {
    
    BrowserProvider,

    JsonRpcProvider,

    Contract,

    parseUnits,

    formatUnits,

    formatEther,

    isAddress,

    ZeroAddress,

    MaxUint256

} from "https://esm.sh/ethers@6";

import {
    RPC,
    SECURITY
} from "./config.js";

import {
    getCurrentNetwork
} from "./networks/index.js";

// =====================================================
// State
// =====================================================

let provider = null;

let signer = null;

let readProvider = null;
let readProviderNetworkKey = null;

// =====================================================
// Validation
// =====================================================

function validateAddress(
    address,
    label = "Address"
) {

    if (

        !SECURITY.strictAddress

    ) {

        return;

    }

    if (

        !isAddress(
            address
        )

    ) {

        throw new Error(

            `${label} is invalid.`

        );

    }

}

// =====================================================
// Request
// =====================================================

async function withTimeout(
    promise,
    timeout = RPC.timeout
) {

    return await Promise.race([

        promise,

        new Promise((_, reject) =>

            setTimeout(

                () => reject(

                    new Error(
                        "RPC request timeout."
                    )

                ),

                timeout

            )

        )

    ]);

}

// =====================================================
// Provider
// =====================================================

export async function getProvider() {

    if (provider)
        return provider;

    if (!window.ethereum) {

        throw new Error(
            "Wallet provider not found."
        );

    }

    provider =
        new BrowserProvider(
            window.ethereum
        );

    return provider;

}

// =====================================================
// Signer
// =====================================================

export async function getSigner() {

    if (signer)
        return signer;

    const currentProvider =
        await getProvider();

    signer =
        await withTimeout(

            currentProvider.getSigner()

       );
    
    return signer;

}

// =====================================================
// Read-only Provider
// =====================================================
// Used for ALL view/read calls (fees, payment methods, stats,
// symbol availability, etc). Deliberately independent from the
// injected wallet provider so:
//   1. Read data (Fee Calculator, Live Preview) works even before
//      a wallet is connected, or when no wallet extension exists.
//   2. Reads always target the currently selected network's RPC,
//      regardless of what chain the connected wallet happens to
//      be on, so numbers never mix data from two chains.
// Falls back to the injected wallet provider only if the network's
// public RPC endpoints all fail (e.g. temporarily down).

export async function getReadProvider() {

    const network = getCurrentNetwork();

    if (readProvider && readProviderNetworkKey === network.key) {
        return readProvider;
    }

    const endpoints = Array.isArray(network.rpc) && network.rpc.length
        ? network.rpc
        : [];

    for (const url of endpoints) {
        try {
            const candidate = new JsonRpcProvider(url, {
                chainId: network.chainId,
                name: network.key
            });
            // Verify the endpoint is actually reachable before committing to it.
            await withTimeout(candidate.getBlockNumber(), 8000);
            readProvider = candidate;
            readProviderNetworkKey = network.key;
            return readProvider;
        } catch (err) {
            console.warn(`RPC endpoint unreachable, trying next: ${url}`, err?.message || err);
        }
    }

    // All public RPCs failed — fall back to the wallet's provider if one
    // is connected, so reads can still succeed rather than hard-failing.
    if (window.ethereum) {
        readProvider = new BrowserProvider(window.ethereum);
        readProviderNetworkKey = network.key;
        return readProvider;
    }

    throw new Error("Could not reach the network. Please check your connection and try again.");
}

// =====================================================
// Refresh Signer
// =====================================================

export function clearSession() {

    provider = null;

    signer = null;

    readProvider = null;

    readProviderNetworkKey = null;

}

// =====================================================
// Native Balance
// =====================================================

export async function getNativeBalance(
    address
) {

    if (!address) {

        return 0n;

    }

    validateAddress(
        address,
        "Wallet"
    );

    const currentProvider =
        await getProvider();

    return await withTimeout(

       currentProvider.getBalance(
           address
       )

    );

}

export async function getFormattedBalance(
    address,
    decimals = 4
) {

    const balance =
        await getNativeBalance(
            address
        );

    return Number(

        formatEther(
            balance
        )

    ).toFixed(
        decimals
    );

}

// =====================================================
// Contract
// =====================================================

export async function getContract(
    address,
    abi,
    readOnly = false
) {

    validateAddress(
        address,
        "Contract"
    );

    if (readOnly) {

        const currentProvider =
            await getReadProvider();

        return new Contract(

            address,

            abi,

            currentProvider

        );

    }

    const currentSigner =
        await getSigner();

    return new Contract(

        address,

        abi,

        currentSigner

    );

}

// =====================================================
// ERC20
// =====================================================

export async function getERC20Balance(

    token,

    account

) {

    const contract =

        await getContract(

            token,

            [

                "function balanceOf(address) view returns (uint256)"

            ],

            true

        );

    return await withTimeout(

       contract.balanceOf(

           account

       )

    );

}

export async function getERC20Allowance(

    token,

    owner,

    spender

) {

    const contract =

        await getContract(

            token,

            [

                "function allowance(address,address) view returns (uint256)"

            ],

            true

        );

    return await withTimeout(

       contract.allowance(

           owner,

           spender

       )

     );

}

// =====================================================
// Transaction
// =====================================================

export async function waitTransaction(
    tx,
    confirmations = 1
) {

    return await withTimeout(

       tx.wait(

          confirmations

       )

    );

}

// =====================================================
// Unit
// =====================================================

export {

    parseUnits,

    formatUnits

};

// =====================================================
// Address
// =====================================================

export {

    isAddress,

    ZeroAddress,

    MaxUint256

};

// =====================================================
// Export
// =====================================================

export default {

    getProvider,

    getReadProvider,

    getSigner,

    getNativeBalance,

    getFormattedBalance,

    getERC20Balance,

    getERC20Allowance,

    getContract,

    waitTransaction,

    clearSession,

    parseUnits,

    formatUnits,

    isAddress,

    ZeroAddress,

    MaxUint256

};
