/**
 * Stripe Service - Client-side API calls
 *
 * This module provides functions to interact with Stripe-related API routes.
 * All functions are meant to be called from React components.
 */

const jsonHeaders = { 'Content-Type': 'application/json' };

/**
 * Generic response handler that throws on errors
 */
const handleResponse = async <T>(response: Response): Promise<T> => {
    const payload = (await response.json().catch(() => ({}))) as { error?: string } & T;
    if (!response.ok) {
        throw new Error(payload.error ?? 'Erreur Stripe');
    }
    return payload;
};

// ============================================================================
// STRIPE CONNECT - Driver bank account management
// ============================================================================

/**
 * Get the status of a driver's Stripe Connect account
 */
export const getStripeStatus = async (accountId: string) =>
    handleResponse<{ charges_enabled: boolean; payouts_enabled: boolean; accountId: string }>(
        await fetch('/api/stripe/connect/status', {
            method: 'POST',
            headers: jsonHeaders,
            body: JSON.stringify({ accountId }),
        }),
    );

/**
 * Create a new Stripe Connect account for a driver, or link an existing one
 */
export const createOrLinkStripeAccount = async (input: {
    uid: string;
    email: string | null;
    firstName?: string | null;
    lastName?: string | null;
    existingAccountId?: string | null;
}) =>
    handleResponse<{ accountId: string }>(
        await fetch('/api/stripe/connect/create-or-link', {
            method: 'POST',
            headers: jsonHeaders,
            body: JSON.stringify({
                uid: input.uid,
                email: input.email,
                firstName: input.firstName,
                lastName: input.lastName,
                existingAccountId: input.existingAccountId,
            }),
        }),
    );

/**
 * Generate a Stripe Connect onboarding link for a driver
 */
export const createStripeAccountLink = async (accountId: string, returnUrl: string) =>
    handleResponse<{ url: string }>(
        await fetch('/api/stripe/connect/account-link', {
            method: 'POST',
            headers: jsonHeaders,
            body: JSON.stringify({ accountId, returnUrl }),
        }),
    );

/**
 * Unlink a driver's Stripe Connect account
 */
export const unlinkStripeAccount = async (accountId: string) =>
    handleResponse<{ success: boolean }>(
        await fetch('/api/stripe/connect/unlink', {
            method: 'POST',
            headers: jsonHeaders,
            body: JSON.stringify({ accountId }),
        }),
    );

// ============================================================================
// CHECKOUT - Payment initiation
// ============================================================================

/**
 * Start the Stripe Checkout flow for booking a trip
 * Creates a checkout session with DEFERRED CAPTURE (payment authorized but not charged)
 */
export const initiateStripeCheckout = async (input: {
    tripId: string;
    buyerUid: string;
    amountCents: number;
    destinationAccount: string;
    quantity?: number;
    tripLabel: string;
}) =>
    handleResponse<{ url: string }>(
        await fetch('/api/stripe/checkout', {
            method: 'POST',
            headers: jsonHeaders,
            body: JSON.stringify({
                tripId: input.tripId,
                buyerUid: input.buyerUid,
                quantity: input.quantity ?? 1,
                amountCents: input.amountCents,
                destinationAccount: input.destinationAccount,
                tripLabel: input.tripLabel,
            }),
        }),
    );

// ============================================================================
// BOOKING MANAGEMENT - Post-trip actions
// ============================================================================

type BookingActionParams = {
    tripId: string;
    orderId: string;
    userId: string;
    role: 'driver' | 'passenger';
};

/**
 * Cancel a booking and release the payment hold
 * - Passenger cancels their own booking (before trip)
 * - Driver cancels any booking (when cancelling trip)
 */
export const cancelBooking = async (params: BookingActionParams) =>
    handleResponse<{ success: boolean }>(
        await fetch('/api/stripe/booking/cancel', {
            method: 'POST',
            headers: jsonHeaders,
            body: JSON.stringify(params),
        }),
    );

/**
 * Confirm that a trip went well
 * When BOTH driver and passenger confirm, payment is automatically captured
 */
export const confirmBooking = async (params: BookingActionParams) =>
    handleResponse<{ success: boolean; captured: boolean }>(
        await fetch('/api/stripe/booking/confirm', {
            method: 'POST',
            headers: jsonHeaders,
            body: JSON.stringify(params),
        }),
    );

/**
 * Report a problem with the trip
 * Blocks payment capture and notifies admin for manual review
 */
export const disputeBooking = async (params: BookingActionParams) =>
    handleResponse<{ success: boolean }>(
        await fetch('/api/stripe/booking/dispute', {
            method: 'POST',
            headers: jsonHeaders,
            body: JSON.stringify(params),
        }),
    );
