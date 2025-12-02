/**
 * POST /api/stripe/booking/capture
 *
 * ADMIN ONLY: Manually captures a single booking's payment.
 * Used for manual intervention when auto-capture isn't appropriate.
 *
 * Use cases:
 * - Resolving a dispute in favor of the driver
 * - Capturing a specific booking manually
 *
 * Security: Requires ADMIN_SECRET to be passed in the request.
 *
 * Required body params:
 * - tripId: string - The trip ID
 * - orderId: string - The booking's order ID
 * - adminSecret: string - Must match ADMIN_SECRET env variable
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
        const { tripId, orderId, adminSecret } = await req.json();

        // Verify admin authorization
        if (adminSecret !== process.env.ADMIN_SECRET) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
        }

        // Validate params
        if (!tripId || !orderId) {
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

        // Can only capture 'authorized' bookings
        if (booking.status !== 'authorized') {
            return NextResponse.json({ error: 'Réservation non capturable' }, { status: 400 });
        }

        // Capture the payment on Stripe
        const now = new Date();
        await stripe.paymentIntents.capture(booking.paymentIntentId);

        // Update booking status
        const updatedBooking: BookingDoc = {
            ...booking,
            status: 'captured',
            capturedAt: now,
        };

        const updatedBookings = [...bookings];
        updatedBookings[bookingIndex] = updatedBooking;

        await updateDoc(tripRef, { bookings: updatedBookings, updatedAt: now });

        return NextResponse.json({ success: true, booking: updatedBooking });
    } catch (error) {
        console.error('capture booking error', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
