// =====================================================
// LaunchFuture
// Shared Network Helpers
// Every network file (evoz.js, ethereum.js, bsc.js, ...) calls
// createNetworkHelpers(NETWORK) and re-exports the result, so every
// chain gets the exact same helper API without copy-pasting it six
// times. Adding a brand new chain later only means: fill in the data
// object below with its real values and call this factory.
// =====================================================

export function createNetworkHelpers(NETWORK) {

    function getChainId() {
        return NETWORK.chainId;
    }

    function getRpcUrl() {
        return NETWORK.rpc?.[0] ?? null;
    }

    function getExplorerUrl() {
        return NETWORK.explorer?.url ?? null;
    }

    function getFactoryAddress() {
        return NETWORK.contracts?.factory || null;
    }

    function getDeployerAddress() {
        return NETWORK.contracts?.deployer || null;
    }

    function getExchangeAddress() {
        return NETWORK.contracts?.exchange || null;
    }

    function getTokenAddress() {
        return NETWORK.contracts?.token || null;
    }

    function getTreasuryAddress() {
        return NETWORK.treasury || null;
    }

    function getAbiPath(name) {
        return NETWORK.abi?.[name] ?? null;
    }

    // A network is only usable end-to-end once its factory contract has
    // actually been deployed on it. `status: "live"` in the network's own
    // data is the source of truth the UI reads (network switcher, etc);
    // this is a convenience mirror of the same check.
    function isLive() {
        return NETWORK.status === "live" && Boolean(NETWORK.contracts?.factory);
    }

    return {
        getChainId,
        getRpcUrl,
        getExplorerUrl,
        getFactoryAddress,
        getDeployerAddress,
        getExchangeAddress,
        getTokenAddress,
        getTreasuryAddress,
        getAbiPath,
        isLive
    };
}

export default { createNetworkHelpers };
