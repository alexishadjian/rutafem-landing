const jsonHeaders = { 'Content-Type': 'application/json' };

const handleResponse = async <T>(response: Response): Promise<T> => {
    const payload = (await response.json().catch(() => ({}))) as { error?: string } & T;
    if (!response.ok) {
        throw new Error(payload.error ?? 'Erreur Stripe');
    }
    return payload;
};

export const getStripeStatus = async (accountId: string) =>
    handleResponse<{ charges_enabled: boolean; payouts_enabled: boolean; accountId: string }>(
        await fetch('/api/stripe/connect/status', {
            method: 'POST',
            headers: jsonHeaders,
            body: JSON.stringify({ accountId }),
        }),
    );

export const createOrLinkStripeAccount = async (input: {
    uid: string;
    email: string | null;
    existingAccountId?: string | null;
}) =>
    handleResponse<{ accountId: string }>(
        await fetch('/api/stripe/connect/create-or-link', {
            method: 'POST',
            headers: jsonHeaders,
            body: JSON.stringify({
                uid: input.uid,
                email: input.email,
                existingAccountId: input.existingAccountId,
            }),
        }),
    );

export const createStripeAccountLink = async (accountId: string, returnUrl: string) =>
    handleResponse<{ url: string }>(
        await fetch('/api/stripe/connect/account-link', {
            method: 'POST',
            headers: jsonHeaders,
            body: JSON.stringify({ accountId, returnUrl }),
        }),
    );

export const unlinkStripeAccount = async (accountId: string) =>
    handleResponse<{ success: boolean }>(
        await fetch('/api/stripe/connect/unlink', {
            method: 'POST',
            headers: jsonHeaders,
            body: JSON.stringify({ accountId }),
        }),
    );

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
