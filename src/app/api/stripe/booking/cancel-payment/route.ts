/**
 * POST /api/stripe/booking/cancel-payment
 *
 * Simple route that ONLY cancels a Stripe PaymentIntent.
 * Firestore updates are done client-side where the user is authenticated.
 *
 * Required body params:
 * - paymentIntentId: string - The Stripe PaymentIntent ID to cancel
 *
 * Returns: { success: boolean }
 */

import { stripe } from '@/lib/stripe';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const { paymentIntentId } = await req.json();

        if (!paymentIntentId) {
            return NextResponse.json({ error: 'paymentIntentId requis' }, { status: 400 });
        }

        // Cancel the PaymentIntent (releases the authorization)
        await stripe.paymentIntents.cancel(paymentIntentId);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('cancel-payment error', error);
        return NextResponse.json({ error: 'Erreur annulation paiement' }, { status: 500 });
    }
}

