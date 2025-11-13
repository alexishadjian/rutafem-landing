import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

const PLATFORM_FEE_PERCENT = 15; // 15%

export async function POST(req: NextRequest) {
    try {
        const {
            tripId,
            buyerUid,
            quantity = 1,
            amountCents,
            destinationAccount,
            tripLabel,
        } = await req.json();
        if (!tripId || !buyerUid) {
            return NextResponse.json({ error: 'tripId et buyerUid requis' }, { status: 400 });
        }
        if (!amountCents || amountCents <= 0) {
            return NextResponse.json({ error: 'amountCents invalide' }, { status: 400 });
        }
        if (!destinationAccount) {
            return NextResponse.json({ error: 'destinationAccount requis' }, { status: 400 });
        }

        const unitAmountCents = Math.round(Number(amountCents));
        const totalAmount = unitAmountCents * Number(quantity);
        const feeAmount = Math.round((totalAmount * PLATFORM_FEE_PERCENT) / 100);

        const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const successUrl = `${origin}/join-trip/success?tripId=${tripId}&session_id={CHECKOUT_SESSION_ID}`;
        const cancelUrl = `${origin}/join-trip/cancel?tripId=${tripId}`;

        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            currency: 'eur',
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: tripLabel || 'Trajet',
                            metadata: { tripId },
                        },
                        unit_amount: unitAmountCents,
                    },
                    quantity,
                },
            ],
            success_url: successUrl,
            cancel_url: cancelUrl,
            payment_intent_data: {
                application_fee_amount: feeAmount,
                transfer_data: { destination: destinationAccount },
                metadata: { tripId, buyerUid, quantity: String(quantity) },
            },
            metadata: { tripId, buyerUid, quantity: String(quantity) },
        });

        return NextResponse.json({ id: session.id, url: session.url });
    } catch (error) {
        console.error('checkout error', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}