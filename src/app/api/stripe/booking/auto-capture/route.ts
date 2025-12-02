/**
 * POST /api/stripe/booking/auto-capture
 *
 * CRON JOB: Automatically captures all eligible bookings after 24h post-departure.
 * Should be called periodically (e.g., every hour) by an external CRON service.
 *
 * Logic:
 * 1. Fetches all active trips
 * 2. For each trip, checks if 24h have passed since departure time
 * 3. If yes, captures all 'authorized' bookings for that trip
 *
 * This ensures drivers get paid even if passengers forget to confirm.
 * Disputed bookings are NOT auto-captured (require manual review).
 *
 * Security: Requires ADMIN_SECRET to be passed in the request.
 *
 * Required body params:
 * - adminSecret: string - Must match ADMIN_SECRET env variable
 *
 * Returns: {
 *   success: boolean,
 *   captured: number,       // Count of successfully captured bookings
 *   capturedIds: string[],  // List of "tripId:orderId" captured
 *   errors: number,         // Count of failed captures
 *   errorDetails: string[]  // Error messages for failed captures
 * }
 *
 * Example CRON call:
 * curl -X POST https://yoursite.com/api/stripe/booking/auto-capture \
 *   -H "Content-Type: application/json" \
 *   -d '{"adminSecret": "your-secret"}'
 */

import { db } from '@/lib/firebaseConfig';
import { stripe } from '@/lib/stripe';
import { BookingDoc, TripDoc } from '@/types/trips.types';
import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const HOURS_BEFORE_AUTO_CAPTURE = 24;

export async function POST(req: NextRequest) {
    try {
        const { adminSecret } = await req.json();

        // Verify admin authorization
        if (adminSecret !== process.env.ADMIN_SECRET) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
        }

        const now = new Date();
        const captured: string[] = [];
        const errors: string[] = [];

        // Get all active trips
        const tripsQuery = query(collection(db, 'trips'), where('isActive', '==', true));
        const tripsSnap = await getDocs(tripsQuery);

        for (const tripDoc of tripsSnap.docs) {
            const trip = tripDoc.data() as TripDoc;
            const bookings = (trip.bookings ?? []) as BookingDoc[];

            // Calculate when auto-capture should happen (departure + 24h)
            const departureDateTime = new Date(`${trip.departureDate}T${trip.departureTime}`);
            const captureDeadline = new Date(departureDateTime.getTime() + HOURS_BEFORE_AUTO_CAPTURE * 60 * 60 * 1000);

            // Skip if deadline not yet reached
            if (now < captureDeadline) continue;

            // Find all 'authorized' bookings (not disputed, not already captured)
            const toCapture = bookings.filter((b) => b.status === 'authorized');
            if (toCapture.length === 0) continue;

            const updatedBookings = [...bookings];

            // Capture each booking
            for (const booking of toCapture) {
                try {
                    await stripe.paymentIntents.capture(booking.paymentIntentId);

                    // Update booking in array
                    const index = updatedBookings.findIndex((b) => b.oderId === booking.oderId);
                    if (index !== -1) {
                        updatedBookings[index] = {
                            ...updatedBookings[index],
                            status: 'captured',
                            capturedAt: now,
                        };
                    }
                    captured.push(`${tripDoc.id}:${booking.oderId}`);
                } catch (err) {
                    errors.push(`${tripDoc.id}:${booking.oderId} - ${err}`);
                }
            }

            // Save all updated bookings for this trip
            if (captured.length > 0) {
                await updateDoc(doc(db, 'trips', tripDoc.id), {
                    bookings: updatedBookings,
                    updatedAt: now,
                });
            }
        }

        return NextResponse.json({
            success: true,
            captured: captured.length,
            capturedIds: captured,
            errors: errors.length,
            errorDetails: errors,
        });
    } catch (error) {
        console.error('auto-capture error', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
