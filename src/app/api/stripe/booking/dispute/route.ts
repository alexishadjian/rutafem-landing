/**
 * POST /api/stripe/booking/dispute
 *
 * Allows a driver or passenger to report a problem with the trip.
 * This BLOCKS the payment from being captured and notifies admins for manual review.
 *
 * Use cases:
 * - Driver no-show
 * - Passenger no-show
 * - Safety issues
 * - Trip didn't happen as planned
 *
 * When disputed:
 * - Booking status becomes 'disputed'
 * - Payment is NOT captured (money stays on hold)
 * - Admin must manually resolve (refund or capture)
 *
 * Required body params:
 * - tripId: string - The trip ID
 * - orderId: string - The booking's order ID
 * - userId: string - The disputing user's ID
 * - role: 'driver' | 'passenger' - Who is disputing
 *
 * Returns: { success: boolean, booking: BookingDoc }
 */

import { db } from '@/lib/firebaseConfig';
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

        // Verify user is authorized to dispute
        if (role === 'driver' && trip.driverId !== userId) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
        }
        if (role === 'passenger' && booking.participantId !== userId) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
        }

        // Can only dispute 'authorized' bookings
        if (booking.status !== 'authorized') {
            return NextResponse.json({ error: 'Réservation déjà traitée' }, { status: 400 });
        }

        // Mark booking as disputed
        const now = new Date();
        const updatedBooking: BookingDoc = {
            ...booking,
            status: 'disputed',
            disputedAt: now,
            disputedBy: role,
        };

        // Save to Firestore
        const updatedBookings = [...bookings];
        updatedBookings[bookingIndex] = updatedBooking;

        await updateDoc(tripRef, { bookings: updatedBookings, updatedAt: now });

        // TODO: Send email notification to admin for manual review
        console.log(`[DISPUTE] Trip ${tripId}, Order ${orderId}, by ${role} (${userId})`);

        return NextResponse.json({ success: true, booking: updatedBooking });
    } catch (error) {
        console.error('dispute booking error', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
