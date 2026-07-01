// =====================================================
// LaunchFuture
// Feature Registry
// =====================================================

const FEATURES = [

    // =================================================
    // Core
    // =================================================

    {
        id: "mintable",
        label: "Mintable",
        category: "core",
        type: "boolean"
    },

    {
        id: "burnable",
        label: "Burnable",
        category: "core",
        type: "boolean"
    },

    {
        id: "ownership",
        label: "Ownership",
        category: "core",
        type: "boolean"
    },

    {
        id: "maxSupply",
        label: "Max Supply",
        category: "core",
        type: "number"
    },

    // =================================================
    // Trading
    // =================================================

    {
        id: "tradingEnable",
        label: "Trading Enable",
        category: "trading",
        type: "boolean"
    },

    {
        id: "tradingDelay",
        label: "Trading Delay",
        category: "trading",
        type: "boolean"
    },

    {
        id: "tradingDelaySeconds",
        label: "Trading Delay Seconds",
        category: "trading",
        type: "number"
    },

    // =================================================
    // Security
    // =================================================

    {
        id: "antiBot",
        label: "Anti Bot",
        category: "security",
        type: "boolean"
    },

    {
        id: "antiBotBlocks",
        label: "Anti Bot Blocks",
        category: "security",
        type: "number"
    },

    {
        id: "blacklist",
        label: "Blacklist",
        category: "security",
        type: "boolean"
    },

    {
        id: "whitelist",
        label: "Whitelist",
        category: "security",
        type: "boolean"
    },

    // =================================================
    // Limits
    // =================================================

    {
        id: "maxWalletEnabled",
        label: "Enable Max Wallet",
        category: "limits",
        type: "boolean"
    },

    {
        id: "maxWalletPercent",
        label: "Max Wallet (%)",
        category: "limits",
        type: "percentage"
    },

    {
        id: "maxTxEnabled",
        label: "Enable Max Transaction",
        category: "limits",
        type: "boolean"
    },

    {
        id: "maxTxPercent",
        label: "Max Transaction (%)",
        category: "limits",
        type: "percentage"
    },

        // =================================================
    // Tax
    // =================================================

    {
        id: "buyTaxEnabled",
        label: "Enable Buy Tax",
        category: "tax",
        type: "boolean"
    },

    {
        id: "buyTax",
        label: "Buy Tax (%)",
        category: "tax",
        type: "percentage"
    },

    {
        id: "sellTaxEnabled",
        label: "Enable Sell Tax",
        category: "tax",
        type: "boolean"
    },

    {
        id: "sellTax",
        label: "Sell Tax (%)",
        category: "tax",
        type: "percentage"
    },

    {
        id: "transferTaxEnabled",
        label: "Enable Transfer Tax",
        category: "tax",
        type: "boolean"
    },

    {
        id: "transferTax",
        label: "Transfer Tax (%)",
        category: "tax",
        type: "percentage"
    },

    {
        id: "burnShare",
        label: "Burn Share (%)",
        category: "tax",
        type: "percentage"
    },

    {
        id: "marketingShare",
        label: "Marketing Share (%)",
        category: "tax",
        type: "percentage"
    },

    {
        id: "developmentShare",
        label: "Development Share (%)",
        category: "tax",
        type: "percentage"
    },

    {
        id: "treasuryShare",
        label: "Treasury Share (%)",
        category: "tax",
        type: "percentage"
    },

    {
        id: "liquidityShare",
        label: "Liquidity Share (%)",
        category: "tax",
        type: "percentage"
    },

    {
        id: "buybackShare",
        label: "Buyback Share (%)",
        category: "tax",
        type: "percentage"
    },

    {
        id: "charityShare",
        label: "Charity Share (%)",
        category: "tax",
        type: "percentage"
    },

    {
        id: "marketingWallet",
        label: "Marketing Wallet",
        category: "tax",
        type: "address"
    },

    {
        id: "developmentWallet",
        label: "Development Wallet",
        category: "tax",
        type: "address"
    },

    {
        id: "treasuryWallet",
        label: "Treasury Wallet",
        category: "tax",
        type: "address"
    },

    {
        id: "liquidityWallet",
        label: "Liquidity Wallet",
        category: "tax",
        type: "address"
    },

    {
        id: "buybackWallet",
        label: "Buyback Wallet",
        category: "tax",
        type: "address"
    },

    {
        id: "charityWallet",
        label: "Charity Wallet",
        category: "tax",
        type: "address"
    },

    {
        id: "taxLocked",
        label: "Tax Lock",
        category: "tax",
        type: "boolean"
    },

    // =================================================
    // Metadata
    // =================================================

    {
        id: "website",
        label: "Website",
        category: "metadata",
        type: "url"
    },

    {
        id: "telegram",
        label: "Telegram",
        category: "metadata",
        type: "url"
    },

    {
        id: "twitter",
        label: "Twitter / X",
        category: "metadata",
        type: "url"
    },

    {
        id: "logoURI",
        label: "Logo URI",
        category: "metadata",
        type: "url"
    },

    {
        id: "contractURI",
        label: "Contract URI",
        category: "metadata",
        type: "url"
    },

    // =================================================
    // Recovery
    // =================================================

    {
        id: "recoverERC20",
        label: "Recover ERC20",
        category: "recovery",
        type: "boolean"
    },

    {
        id: "recoverNative",
        label: "Recover Native",
        category: "recovery",
        type: "boolean"
    },

    // =================================================
    // Advanced
    // =================================================

    {
        id: "permit",
        label: "ERC20 Permit",
        category: "advanced",
        type: "boolean"
    },

    {
        id: "analytics",
        label: "Analytics",
        category: "advanced",
        type: "boolean"
    },

    {
        id: "renounceOwnership",
        label: "Renounce Ownership",
        category: "advanced",
        type: "boolean"
    }

];

export default FEATURES;
