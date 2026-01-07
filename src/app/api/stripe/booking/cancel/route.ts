/**
 * POST /api/stripe/booking/cancel
 *
 * Cancels a booking and releases the payment authorization.
 * No money is charged - the hold on the card is simply released.
 *
 * Who can cancel:
 * - Passenger: can cancel their own booking (before trip)
 * - Driver: can cancel any booking on their trip (e.g., when cancelling the whole trip)
 *
 * When cancelled:
 * - Stripe PaymentIntent is cancelled (releases the hold)
 * - Booking status becomes 'cancelled'
 * - Passenger is removed from participants
 * - Available seats are restored
 *
 * Required body params:
 * - tripId: string - The trip ID
 * - orderId: string - The booking's order ID
 * - userId: string - The cancelling user's ID
 * - role: 'driver' | 'passenger' - Who is cancelling
 *
 * Returns: { success: boolean, booking: BookingDoc }
 */

import { db } from '@/lib/firebaseConfig';
import { stripe } from '@/lib/stripe';
import { BookingDoc, TripDoc } from '@/types/trips.types';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const { tripId, orderId, userId, role } = await req.json();

        // Validate params
        if (!tripId || !orderId || !userId || !role) {
            return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
        }

        // Get trip from Firestore
        const tripRef = doc(db, 'trips', tripId);
        const tripSnap = await getDoc(tripRef);
        if (!tripSnap.exists()) {
            return NextResponse.json({ error: 'Trajet non trouvé' }, { status: 404 });
        }

        const trip = tripSnap.data() as TripDoc;
        const bookings = (trip.bookings ?? []) as BookingDoc[];
        const bookingIndex = bookings.findIndex((b) => b.oderId === orderId);

        if (bookingIndex === -1) {
            return NextResponse.json({ error: 'Réservation non trouvée' }, { status: 404 });
        }

        const booking = bookings[bookingIndex];

        // Verify user is authorized to cancel
        // Driver can cancel any booking, passenger can only cancel their own
        if (role === 'driver' && trip.driverId !== userId) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
        }
        if (role === 'passenger' && booking.participantId !== userId) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
        }

        // Can only cancel 'authorized' bookings (not already captured or cancelled)
        if (booking.status !== 'authorized') {
            return NextResponse.json({ error: 'Réservation non annulable' }, { status: 400 });
        }

        // Cancel the PaymentIntent on Stripe (releases the authorization, no charge)
        const now = new Date();
        await stripe.paymentIntents.cancel(booking.paymentIntentId);

        // Update booking status
        const updatedBooking: BookingDoc = {
            ...booking,
            status: 'cancelled',
            cancelledAt: now,
        };

        const updatedBookings = [...bookings];
        updatedBookings[bookingIndex] = updatedBooking;

        // Remove passenger from participants and restore available seat
        const updatedParticipants = trip.participants.filter((p) => p !== booking.participantId);

        await updateDoc(tripRef, {
            bookings: updatedBookings,
            participants: updatedParticipants,
            availableSeats: trip.availableSeats + 1,
            updatedAt: now,
        });

        return NextResponse.json({ success: true, booking: updatedBooking });
    } catch (error) {
        console.error('cancel booking error', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
