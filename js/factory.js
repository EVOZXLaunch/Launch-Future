// =====================================================
// LaunchFuture
// Factory Manager
// =====================================================

import {

    getCurrentNetwork

} from "./networks/index.js";

import {

    loadABI

} from "./abi/loader.js";

import {

    getContract

} from "./blockchain.js";

// =====================================================
// State
// =====================================================

let factory = null;

let factoryReadOnly = null;

let factoryABI = null;

// =====================================================
// Factory Contract (signer-bound — required for txs)
// =====================================================

export async function getFactory() {

    if (factory) {

        return factory;

    }

    const network =
        getCurrentNetwork();

    factoryABI =
        await loadABI(
            "LFTFactory"
        );

    factory =
    await getContract(

        network.contracts.factory,

        factoryABI

    );

    return factory;

}

// =====================================================
// Factory Contract (read-only — no signer/wallet needed)
// Used for view calls (fees, payment methods, stats, etc)
// so they work even before a wallet is connected.
// =====================================================

export async function getFactoryReadOnly() {

    if (factoryReadOnly) {

        return factoryReadOnly;

    }

    const network =
        getCurrentNetwork();

    factoryABI =
        factoryABI ??
        await loadABI(
            "LFTFactory"
        );

    factoryReadOnly =
    await getContract(

        network.contracts.factory,

        factoryABI,

        true

    );

    return factoryReadOnly;

}

// =====================================================
// Reset
// =====================================================

export function clearFactory() {

    factory = null;

    factoryReadOnly = null;

    factoryABI = null;

}

// =====================================================
// Symbol
// =====================================================

export async function symbolExists(
    symbol
) {

    const contract =
        await getFactoryReadOnly();

    return await contract
        .symbolExists(
            symbol
        );

}

export async function isSymbolAvailable(
    symbol
) {

    const contract =
        await getFactoryReadOnly();

    return await contract
        .isSymbolAvailable(
            symbol
        );

}

// =====================================================
// Payment
// =====================================================

export async function getPaymentMethod(
    symbol
) {

    const contract =
        await getFactoryReadOnly();

    return await contract
        .getPaymentMethod(
            symbol
        );

}

export async function getDeployFee(
    paymentSymbol
) {

    const contract =
        await getFactoryReadOnly();

    return await contract
        .getDeployFee(
            paymentSymbol
        );

}

export async function quoteNativeFee(
    paymentSymbol
) {

    const contract =
        await getFactoryReadOnly();

    return await contract
        .quoteNativeFee(
            paymentSymbol
        );

}

// =====================================================
// Statistics
// =====================================================

export async function getStatistics() {

    const contract =
        await getFactoryReadOnly();

    return await contract
        .getStatistics();

}

export async function getFactoryTokenCount() {

    const contract =
        await getFactoryReadOnly();

    return await contract
        .getFactoryTokenCount();

}

// =====================================================
// Predict
// =====================================================

export async function predictTokenAddress(
    config,
    metadata,
    salt
) {

    const contract =
        await getFactoryReadOnly();

    return await contract
        .predictTokenAddress(

            config,

            metadata,

            salt

        );

}

// =====================================================
// Transaction
// =====================================================

async function executeTransaction(
    contract,
    tx
) {

    const receipt =

        await tx.wait();

    // The factory's deploy functions return the new token's address as
    // their function return value, but since these are state-changing
    // transactions sent through a signer, that return value is never
    // surfaced to us directly — it has to be decoded from the
    // TokenDeployed event in the receipt's logs instead.
    let tokenAddress = null;

    for (const log of receipt.logs ?? []) {

        try {

            const parsed = contract.interface.parseLog(log);

            if (parsed?.name === "TokenDeployed") {

                tokenAddress = parsed.args.token;

                break;

            }

        } catch {
            // log belongs to another contract (e.g. the token itself), ignore
        }

    }

    return {

        tx,

        receipt,

        tokenAddress,

        txHash:

            receipt.hash,

        blockNumber:

            receipt.blockNumber

    };

}

// =====================================================
// Deploy
// =====================================================

export async function deployWithNative(
    config,
    metadata,
    value
) {

    const contract =
        await getFactory();

    const tx =
        await contract.deployWithNative(

            config,

            metadata,

            {

                value

            }

        );

    return await executeTransaction(

    contract,

    tx

);

}

export async function deployWithPermit(
    config,
    metadata,
    paymentSymbol,
    deadline,
    v,
    r,
    s
) {

    const contract =
        await getFactory();

    const tx =
        await contract.deployWithPermit(

            config,

            metadata,

            paymentSymbol,

            deadline,

            v,

            r,

            s

        );

    return await executeTransaction(

    contract,

    tx

);

}

export async function deployCreate2(
    config,
    metadata,
    paymentSymbol,
    salt
) {

    const contract =
        await getFactory();

    const tx =
        await contract.deployCreate2(

            config,

            metadata,

            paymentSymbol,

            salt

        );

    return await executeTransaction(

    contract,

    tx

);

}

// =====================================================
// Export
// =====================================================

export default {

    getFactory,

    getFactoryReadOnly,

    clearFactory,

    symbolExists,

    isSymbolAvailable,

    getPaymentMethod,

    getDeployFee,

    quoteNativeFee,

    getStatistics,

    getFactoryTokenCount,

    predictTokenAddress,

    deployWithNative,

    deployWithPermit,

    deployCreate2

};
