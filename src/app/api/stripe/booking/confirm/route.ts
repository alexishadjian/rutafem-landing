/**
 * POST /api/stripe/booking/confirm
 *
 * Allows a driver or passenger to confirm that a trip went well.
 * When BOTH parties confirm, the payment is automatically captured.
 *
 * Flow:
 * 1. Driver confirms → driverConfirmedAt is set
 * 2. Passenger confirms → passengerConfirmedAt is set
 * 3. If both confirmed → Stripe payment is captured, status becomes 'captured'
 *
 * Required body params:
 * - tripId: string - The trip ID
 * - orderId: string - The booking's order ID
 * - userId: string - The confirming user's ID
 * - role: 'driver' | 'passenger' - Who is confirming
 *
 * Returns: { success: boolean, captured: boolean, booking: BookingDoc }
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
        if (role !== 'driver' && role !== 'passenger') {
            return NextResponse.json({ error: 'Role invalide' }, { status: 400 });
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

        // Verify user is authorized to confirm
        if (role === 'driver' && trip.driverId !== userId) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
        }
        if (role === 'passenger' && booking.participantId !== userId) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
        }

        // Can only confirm 'authorized' bookings
        if (booking.status !== 'authorized') {
            return NextResponse.json({ error: 'Réservation déjà traitée' }, { status: 400 });
        }

        // Update confirmation timestamp based on role
        const now = new Date();
        const updatedBooking: BookingDoc = { ...booking };

        if (role === 'driver') {
            updatedBooking.driverConfirmedAt = now;
        } else {
            updatedBooking.passengerConfirmedAt = now;
        }

        // Check if both parties have confirmed
        const bothConfirmed = updatedBooking.driverConfirmedAt && updatedBooking.passengerConfirmedAt;

        // If both confirmed, capture the payment
        if (bothConfirmed) {
            await stripe.paymentIntents.capture(booking.paymentIntentId);
            updatedBooking.status = 'captured';
            updatedBooking.capturedAt = now;
        }

        // Save updated booking to Firestore
        const updatedBookings = [...bookings];
        updatedBookings[bookingIndex] = updatedBooking;

        await updateDoc(tripRef, { bookings: updatedBookings, updatedAt: now });

        return NextResponse.json({
            success: true,
            captured: bothConfirmed,
            booking: updatedBooking,
        });
    } catch (error) {
        console.error('confirm booking error', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
