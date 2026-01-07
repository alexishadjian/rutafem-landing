/**
 * POST /api/stripe/booking/capture-payment
 *
 * Simple route that ONLY captures a Stripe PaymentIntent.
 * Firestore updates are done client-side where the user is authenticated.
 *
 * Required body params:
 * - paymentIntentId: string - The Stripe PaymentIntent ID to capture
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

        // Capture the payment
        await stripe.paymentIntents.capture(paymentIntentId);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('capture-payment error', error);
        return NextResponse.json({ error: 'Erreur capture paiement' }, { status: 500 });
    }
}

