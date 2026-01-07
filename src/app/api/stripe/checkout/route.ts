/**
 * POST /api/stripe/checkout
 *
 * Creates a Stripe Checkout session for booking a trip seat.
 * Uses DEFERRED CAPTURE (capture_method: 'manual') so the payment is only
 * authorized, not charged immediately. The actual capture happens later
 * when both driver and passenger confirm the trip went well.
 *
 * Flow:
 * 1. Passenger clicks "Book" → this route creates a checkout session
 * 2. Passenger pays → Stripe authorizes (holds) the amount on their card
 * 3. Webhook receives 'checkout.session.completed' → creates booking with status 'authorized'
 * 4. After trip: both parties confirm → payment is captured
 *
 * Required body params:
 * - tripId: string - The trip to book
 * - buyerUid: string - The passenger's user ID
 * - amountCents: number - Price per seat in cents
 * - destinationAccount: string - Driver's Stripe Connect account ID
 * - tripLabel: string - Display name for the trip
 * - quantity?: number - Number of seats (default: 1)
 *
 * Returns: { id: string, url: string } - Checkout session ID and redirect URL
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { randomBytes } from 'crypto';

export const dynamic = 'force-dynamic';

const PLATFORM_FEE_PERCENT = 15; // 15% commission for the platform

export async function POST(req: NextRequest) {
    try {
        const { tripId, buyerUid, quantity = 1, amountCents, destinationAccount, tripLabel } = await req.json();

        // Validate required params
        if (!tripId || !buyerUid) {
            return NextResponse.json({ error: 'tripId et buyerUid requis' }, { status: 400 });
        }
        if (!amountCents || amountCents <= 0) {
            return NextResponse.json({ error: 'amountCents invalide' }, { status: 400 });
        }
        if (!destinationAccount) {
            return NextResponse.json({ error: 'destinationAccount requis' }, { status: 400 });
        }

        // Calculate amounts
        const unitAmountCents = Math.round(Number(amountCents));
        const totalAmount = unitAmountCents * Number(quantity);
        const feeAmount = Math.round((totalAmount * PLATFORM_FEE_PERCENT) / 100);

        // Generate unique order ID for this booking
        const orderId = randomBytes(8).toString('hex');

        // Build redirect URLs
        const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const successUrl = `${origin}/join-trip/success?tripId=${tripId}&session_id={CHECKOUT_SESSION_ID}`;
        const cancelUrl = `${origin}/join-trip/cancel?tripId=${tripId}`;

        // Create Stripe Checkout session with deferred capture
        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            currency: 'eur',
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: { name: tripLabel || 'Trajet', metadata: { tripId } },
                        unit_amount: unitAmountCents,
                    },
                    quantity,
                },
            ],
            success_url: successUrl,
            cancel_url: cancelUrl,
            payment_intent_data: {
                // IMPORTANT: Manual capture = authorize only, charge later
                capture_method: 'manual',
                application_fee_amount: feeAmount,
                transfer_data: { destination: destinationAccount },
                metadata: { tripId, buyerUid, orderId, quantity: String(quantity), amountCents: String(totalAmount) },
            },
            metadata: { tripId, buyerUid, orderId, quantity: String(quantity), amountCents: String(totalAmount) },
        });

        return NextResponse.json({ id: session.id, url: session.url });
    } catch (error) {
        console.error('checkout error', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
