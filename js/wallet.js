// =====================================================
// LaunchFuture
// Wallet Manager
// Part 1
// =====================================================

import {
    
    getProvider,

    getSigner as blockchainGetSigner,

    clearSession,

    getNativeBalance

} from "./blockchain.js";

import {

    CACHE

} from "./config.js";

// =====================================================
// Storage
// =====================================================

const STORAGE_KEY =
    CACHE.wallet;

// =====================================================
// State
// =====================================================

let account = null;

let chainId = null;

let connected = false;

let walletName = null;

let network = null;

let connectedAt = null;

// =====================================================
// Storage Helpers
// =====================================================

function saveWalletState() {

    localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify({

            connected,

            account,

            chainId,

            walletName,

            network,

            connectedAt

        })

    );

}

function loadWalletState() {

    const saved =

        localStorage.getItem(

            STORAGE_KEY

        );

    return saved ?

        JSON.parse(

            saved

        )

        : null;

}

function clearWalletState() {

    localStorage.removeItem(

        STORAGE_KEY

    );

}

// =====================================================
// State Helpers
// =====================================================

function updateWalletState({

    account: newAccount,

    chainId: newChainId,

    network: newNetwork,

    walletName: newWalletName,

    connectedAt: newConnectedAt = Date.now()

}) {

    account =
        newAccount;

    chainId =
        newChainId;

    network =
        newNetwork;

    walletName =
        newWalletName;

    connectedAt =
        newConnectedAt;

    connected =
        Boolean(
            account
        );

}

function resetWalletState() {

    updateWalletState({

        account:
            null,

        chainId:
            null,

        network:
            null,

        walletName:
            null,

        connectedAt:
            null

    });

}

// =====================================================
// Refresh Wallet State
// =====================================================

async function refreshWalletState() {

    const provider =
        await getProvider();

    const accounts =
        await provider.send(

            "eth_accounts",

            []

        );

    const currentNetwork =
        await provider.getNetwork();

    updateWalletState({

        account:
            accounts[0] ?? null,

        chainId:
            Number(
                currentNetwork.chainId
            ),

        network: {

            chainId:
                Number(
                    currentNetwork.chainId
                ),

            name:
                currentNetwork.name

        },

        walletName:
            detectWallet()

    });

}

// =====================================================
// Connect
// =====================================================

export async function connectWallet() {

    if (!window.ethereum) {

        throw new Error(
            "EVM wallet not detected."
        );

    }

    const provider =
    await getProvider();

await provider.send(

    "eth_requestAccounts",

    []

);

await refreshWalletState();

saveWalletState();

return {

    connected,

    account,

    chainId,

    walletName,

    network,

    connectedAt

};

}

// =====================================================
// Wallet Detection
// =====================================================

function detectWallet() {

    const ethereum =
        window.ethereum;

    if (!ethereum) {

        return "Unknown";

    }

    if (ethereum.isTokenPocket) {

        return "TokenPocket";

    }

    if (ethereum.isOKXWallet) {

        return "OKX";

    }

    if (ethereum.isRabby) {

        return "Rabby";

    }

    if (ethereum.isBitgetWallet) {

        return "Bitget";

    }

    if (ethereum.isMetaMask) {

        return "MetaMask";

    }

    return "EVM Wallet";

}

// =====================================================
// Disconnect
// =====================================================

export function disconnectWallet() {

    resetWalletState();

    clearSession();

    clearWalletState();

}

// =====================================================
// Restore Connection
// =====================================================

export async function restoreConnection() {

    const saved =

        loadWalletState();

    if (!saved) {

        return false;

    }

    if (!window.ethereum) {

        return false;

    }

    await refreshWalletState();

    saveWalletState();

    return true;

}

// =====================================================
// Switch Network
// =====================================================

export async function switchNetwork(
    chainId
) {

    if (!window.ethereum) {

        throw new Error(
            "Wallet provider not found."
        );

    }

    await window.ethereum.request({

        method:
            "wallet_switchEthereumChain",

        params: [{

            chainId:
                `0x${Number(chainId).toString(16)}`

        }]

    });

}

// =====================================================
// Ensure Network (switch, or add-then-switch as a fallback)
// =====================================================
// Wallets throw error code 4902 from wallet_switchEthereumChain when the
// chain has never been added before. In that case we fall back to
// wallet_addEthereumChain using the network's own config, then the
// wallet switches to it automatically once added.

export async function ensureNetwork(network) {

    if (!window.ethereum) {
        throw new Error("Wallet provider not found.");
    }

    const hexChainId = `0x${Number(network.chainId).toString(16)}`;

    try {

        await switchNetwork(network.chainId);

    } catch (err) {

        const notAdded = err?.code === 4902 ||
            /unrecognized chain|4902/i.test(err?.message || "");

        if (!notAdded) {
            throw err;
        }

        await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
                chainId: hexChainId,
                chainName: network.name,
                nativeCurrency: {
                    name: network.currency?.name ?? network.symbol,
                    symbol: network.currency?.symbol ?? network.symbol,
                    decimals: network.currency?.decimals ?? 18
                },
                rpcUrls: network.rpc ?? [],
                blockExplorerUrls: network.explorer?.url ? [network.explorer.url] : []
            }]
        });
    }

    await refreshWalletState();
    saveWalletState();
}

// =====================================================
// Wallet Events
// =====================================================

export function registerWalletEvents(
    callbacks = {}
) {

    if (!window.ethereum) {

        return;

    }

    const {

        onAccountsChanged,

        onChainChanged,

        onDisconnect

    } = callbacks;

    window.ethereum.on(

        "accountsChanged",

        async accounts => {

    await refreshWalletState();

    saveWalletState();

    if (

        typeof onAccountsChanged ===
        "function"

    ) {

        onAccountsChanged(

            account

        );

    }

        }

    );

    window.ethereum.on(

    "chainChanged",

    async () => {

        await refreshWalletState();

        saveWalletState();

        if (

            typeof onChainChanged ===
            "function"

        ) {

            onChainChanged(

                chainId

            );

        }

    }

);

    window.ethereum.on(

        "disconnect",

        error => {

            disconnectWallet();

            if (

                typeof onDisconnect ===
                "function"

            ) {

                onDisconnect(
                    error
                );

            }

        }

    );

}

// =====================================================
// Getters
// =====================================================

export function isConnected() {

    return connected;

}

export function getAccount() {

    return account;

}

export function getChainId() {

    return chainId;

}

export function getWalletName() {

    return walletName;

}

export function getNetwork() {

    return network;

}

export function getConnectedAt() {

    return connectedAt;

}

// =====================================================
// Balance
// =====================================================

export async function getBalance() {

    if (!connected) {

        return 0n;

    }

    return await getNativeBalance(
        account
    );

}

// =====================================================
// Wallet Info
// =====================================================

export function getWallet() {

    return {

        connected,

        account,

        chainId,

        walletName,

        network,

        connectedAt

    };

}

export async function getWalletProvider() {

    return await getProvider();

}

export async function getWalletSigner() {

    return await blockchainGetSigner();

}

export async function getSigner() {

    return await blockchainGetSigner();

}

export default {

    connectWallet,

    disconnectWallet,

    restoreConnection,

    switchNetwork,

    ensureNetwork,

    registerWalletEvents,

    isConnected,

    getAccount,

    getChainId,

    getWalletName,

    getNetwork,

    getConnectedAt,

    getBalance,

    getWallet,

    getWalletProvider,

    getWalletSigner,

    getSigner

};
