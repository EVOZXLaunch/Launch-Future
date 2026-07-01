// =====================================================
// LaunchFuture
// Utility Functions
// =====================================================

// =====================================================
// Number
// =====================================================

export function clamp(
    value,
    min,
    max
) {
    
    return Math.min(
        Math.max(value, min),
        max
    );

}

export function isNumber(
    value
) {

    return !Number.isNaN(
        Number(value)
    );

}

// =====================================================
// String
// =====================================================

export function capitalize(
    text = ""
) {

    if (!text.length)
        return "";

    return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
    );

}

export function shortenAddress(
    address,
    start = 6,
    end = 4
) {

    if (!address)
        return "";

    return `${address.slice(0, start)}...${address.slice(-end)}`;

}

// =====================================================
// Clipboard
// =====================================================

export async function copyText(
    text
) {

    await navigator.clipboard.writeText(
        text
    );

}

// =====================================================
// Time
// =====================================================

export function sleep(
    ms
) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                ms
            )
    );

}

// =====================================================
// URL
// =====================================================

export function openExplorer(
    explorer,
    path
) {

    window.open(
        `${explorer}/${path}`,
        "_blank"
    );

}

// =====================================================
// Array
// =====================================================

export function unique(
    array
) {

    return [
        ...new Set(array)
    ];

}

// =====================================================
// Object
// =====================================================

export function deepFreeze(
    object
) {

    Object.freeze(
        object
    );

    Object
        .values(object)
        .forEach(value => {

            if (

                value &&
                typeof value ===
                    "object"

            ) {

                deepFreeze(
                    value
                );

            }

        });

    return object;

              }
