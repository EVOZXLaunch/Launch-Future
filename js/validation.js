// =====================================================
// LaunchFuture
// Validation Manager
// =====================================================

import {

    LIMITS

} from "./config.js";

import {

    isAddress

} from "./blockchain.js";

// =====================================================
// Helpers
// =====================================================

function success() {

    return {

        valid: true,

        errors: []

    };

}

function failure(
    field,
    message
) {

    return {

        field,

        message

    };

}

// =====================================================
// Token Validation
// =====================================================

export async function validateTokenConfig(
    config
) {

    const errors = [];

    // -----------------
    // Name
    // -----------------

    if (

        !config.name ||

        config.name.trim().length <

        LIMITS.minNameLength

    ) {

        errors.push(

            failure(

                "name",

                "Token name is too short."

            )

        );

    }

    if (

        config.name &&

        config.name.length >

        LIMITS.maxNameLength

    ) {

        errors.push(

            failure(

                "name",

                "Token name is too long."

            )

        );

    }

    // -----------------
    // Symbol
    // -----------------

    if (

        !config.symbol ||

        config.symbol.trim().length <

        LIMITS.minSymbolLength

    ) {

        errors.push(

            failure(

                "symbol",

                "Token symbol is too short."

            )

        );

    }

    if (

        config.symbol &&

        config.symbol.length >

        LIMITS.maxSymbolLength

    ) {

        errors.push(

            failure(

                "symbol",

                "Token symbol is too long."

            )

        );

    }

    // -----------------
    // Owner
    // -----------------

    if (

        !isAddress(
            config.owner
        )

    ) {

        errors.push(

            failure(

                "owner",

                "Invalid owner address."

            )

        );

    }

      // -----------------
    // Supply
    // -----------------

    if (

        config.supply === undefined ||

        config.supply === null ||

        Number(config.supply) <= 0

    ) {

        errors.push(

            failure(

                "supply",

                "Invalid token supply."

            )

        );

    }

    // -----------------
    // Decimals
    // -----------------

    if (

        config.decimals === undefined ||

        config.decimals === null ||

        Number(config.decimals) < 0 ||

        Number(config.decimals) > 18

    ) {

        errors.push(

            failure(

                "decimals",

                "Decimals must be between 0 and 18."

            )

        );

    }

    // -----------------
    // Mintable
    // -----------------

    if (

        typeof config.mintable !==
        "boolean"

    ) {

        errors.push(

            failure(

                "mintable",

                "Invalid Mintable option."

            )

        );

    }

    // -----------------
    // Burnable
    // -----------------

    if (

        typeof config.burnable !==
        "boolean"

    ) {

        errors.push(

            failure(

                "burnable",

                "Invalid Burnable option."

            )

        );

    }
  
    // -----------------
    // Result
    // -----------------

    if (

        errors.length === 0

    ) {

        return success();

    }

    return {

        valid: false,

        errors

    };

}

export default {

    validateTokenConfig

};
