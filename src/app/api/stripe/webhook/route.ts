/**
 * POST /api/stripe/webhook
 *
 * Stripe webhook handler. Receives events from Stripe and updates Firestore accordingly.
 *
 * Handled events:
 * - checkout.session.completed: Creates a new booking with status 'authorized'
 * - payment_intent.canceled: Logs when an authorization expires or is cancelled
 *
 * When a checkout completes:
 * 1. Extracts metadata (tripId, buyerUid, orderId, amountCents)
 * 2. Validates the trip is still active and has available seats
 * 3. Creates a new Booking object in the trip's bookings array
 * 4. Adds the passenger to participants and decrements available seats
 *
 * Security: Validates Stripe signature to ensure the request is genuine.
 */

import { db } from '@/lib/firebaseConfig';
import { stripe } from '@/lib/stripe';
import { BookingDoc, TripDoc } from '@/types/trips.types';
import { arrayUnion, doc, getDoc, updateDoc } from 'firebase/firestore';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    // Get Stripe signature from headers
    const sig = (await headers()).get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string | undefined;

    let event: Stripe.Event;

    // Verify webhook signature
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
        switch (event.type) {
            // Payment authorized (not captured yet)
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const paymentIntentId = session.payment_intent as string;
                const metadata = session.metadata || {};
                const { tripId, buyerUid, orderId, amountCents } = metadata;
                const quantity = Number(metadata.quantity || '1');

                // Skip if missing required data
                if (!tripId || !buyerUid || !orderId) break;

                // Get trip from Firestore
                const tripRef = doc(db, 'trips', tripId);
                const tripSnap = await getDoc(tripRef);
                if (!tripSnap.exists()) break;

                const trip = tripSnap.data() as TripDoc;

                // Validate trip is bookable
                if (!trip.isActive || trip.availableSeats < quantity) break;
                if (trip.participants.includes(buyerUid)) break;

                // Create new booking with 'authorized' status (payment held, not captured)
                const newBooking: BookingDoc = {
                    oderId: orderId,
                    participantId: buyerUid,
                    paymentIntentId,
                    status: 'authorized',
                    amountCents: Number(amountCents),
                    createdAt: new Date(),
                };

                // Update trip: add booking, add participant, decrement seats
                await updateDoc(tripRef, {
                    participants: arrayUnion(buyerUid),
                    availableSeats: trip.availableSeats - quantity,
                    bookings: arrayUnion(newBooking),
                    updatedAt: new Date(),
                });

                // TODO: Send confirmation email with link to /trip/[tripId]/confirm?orderId=xxx
                console.log(`[BOOKING] New booking created - Trip: ${tripId}, Order: ${orderId}`);
                break;
            }

            // Authorization cancelled or expired
            case 'payment_intent.canceled': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                console.log(`[CANCELLED] PaymentIntent ${paymentIntent.id} was cancelled`);
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
