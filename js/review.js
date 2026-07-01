// =====================================================
// LaunchFuture
// Review Generator
// =====================================================

import {

    getWizardData

} from "./wizard.js";

import {

    getCurrentNetwork

} from "./networks/index.js";

// =====================================================
// Review
// =====================================================

export function buildReview() {

    const wizard =

        getWizardData();

    const network =

        getCurrentNetwork();

    return {

        token:

            wizard.token,

        features:

            wizard.features,

        metadata:

            wizard.metadata,

        payment:

            wizard.payment,

        network

    };

}

// =====================================================
// Sections
// =====================================================

export function getTokenReview() {

    return getWizardData()

        .token;

}

export function getFeatureReview() {

    return getWizardData()

        .features;

}

export function getMetadataReview() {

    return getWizardData()

        .metadata;

}

export function getPaymentReview() {

    return getWizardData()

        .payment;

}

export function getNetworkReview() {

    return getCurrentNetwork();

}

// =====================================================
// Review Status
// =====================================================

export function getReviewStatus() {

    const {

        token,

        metadata,

        payment

    } = getWizardData();

    const warnings = [];

    if (

        !token.name

    ) {

        warnings.push(

            "Token name is empty."

        );

    }

    if (

        !token.symbol

    ) {

        warnings.push(

            "Token symbol is empty."

        );

    }

    if (

        !token.supply

    ) {

        warnings.push(

            "Token supply is empty."

        );

    }

    if (

        !payment.symbol

    ) {

        warnings.push(

            "Payment method is not selected."

        );

    }

    if (

        !metadata.website

    ) {

        warnings.push(

            "Website is not provided."

        );

    }

    return {

        ready:

            warnings.length === 0,

        warnings

    };

}

// =====================================================
// Summary
// =====================================================

export function getReviewSummary() {

    const review =

        buildReview();

    const status =

        getReviewStatus();

    return {

        network:

            review.network.name,

        token:

            {

                name:

                    review.token.name,

                symbol:

                    review.token.symbol,

                supply:

                    review.token.supply

            },

        featureCount:

            Object.keys(

                review.features

            ).length,

        payment:

            review.payment,

        status

    };

}

// =====================================================
// Export
// =====================================================

export function exportReview() {

    return JSON.stringify(

        buildReview(),

        null,

        4

    );

}

export function exportReviewSummary() {

    return JSON.stringify(

        getReviewSummary(),

        null,

        4

    );

}

export function exportReviewStatus() {

    return JSON.stringify(

        getReviewStatus(),

        null,

        4

    );

}
