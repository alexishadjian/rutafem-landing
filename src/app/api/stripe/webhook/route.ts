import { db } from '@/lib/firebaseConfig';
import { stripe } from '@/lib/stripe';
import { Trip } from '@/types/trips.types';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    const sig = (await headers()).get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string | undefined;

    let event: Stripe.Event;

    try {
        const rawBody = await req.text();
        if (!webhookSecret || !sig) {
            return NextResponse.json({ error: 'Configuration webhook manquante' }, { status: 400 });
        }
        event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed.', err);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    try {
        console.log('-----event', event);
        switch (event.type) {
            case 'checkout.session.completed': {
                console.log('-----checkout.session.completed');

                const session = event.data.object as Stripe.Checkout.Session;
                const paymentIntentId = session.payment_intent as string;
                const metadata = session.metadata || {};
                const tripId = metadata.tripId as string;
                const buyerUid = metadata.buyerUid as string;
                const quantity = Number(metadata.quantity || '1');

                if (!tripId || !buyerUid) break;

                const tripRef = doc(db, 'trips', tripId);
                const tripSnap = await getDoc(tripRef);
                if (tripSnap.exists()) {
                    const trip = tripSnap.data() as Trip;
                    if (
                        trip.isActive &&
                        trip.availableSeats >= quantity &&
                        !trip.participants.includes(buyerUid)
                    ) {
                        const updatedParticipants = [...trip.participants, buyerUid];
                        const updatedAvailable = trip.availableSeats - quantity;
                        await updateDoc(tripRef, {
                            participants: updatedParticipants,
                            availableSeats: updatedAvailable,
                            updatedAt: new Date(),
                            lastPaymentIntentId: paymentIntentId,
                        });
                    }
                }
                break;
            }
            case 'charge.refunded': {
                // TODO: log refunds if needed later
                break;
            }
            default:
                break;
        }
        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Webhook handler error', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export const config = {
    api: {
        bodyParser: false,
    },
};
