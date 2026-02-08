/**
 * GET /api/stripe/booking/auto-capture (Vercel Cron)
 * POST /api/stripe/booking/auto-capture (Manual admin call)
 *
 * Automatically captures all eligible bookings 48h after departure.
 * This gives passengers ~24h after receiving the confirmation reminder
 * email (sent at J+1 08:00 UTC) to confirm or dispute.
 *
 * Timeline:
 * - J+0: Trip happens
 * - J+1 08:00 UTC: Confirmation reminder emails sent (cron)
 * - J+2 09:00 UTC: Auto-capture runs (this cron), captures remaining 'authorized' bookings
 *
 * Disputed bookings are NOT auto-captured (require manual admin review).
 *
 * Security:
 * - GET: Protected by CRON_SECRET (Vercel cron header)
 * - POST: Protected by ADMIN_SECRET in body (manual trigger)
 */

import { db } from '@/lib/firebaseConfig';
import { stripe } from '@/lib/stripe';
import { BookingDoc, TripDoc } from '@/types/trips.types';
import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// 48h after departure = ~24h after reminder emails are sent
const HOURS_BEFORE_AUTO_CAPTURE = 48;

/** Shared capture logic used by both GET (cron) and POST (manual) */
const runAutoCapture = async () => {
    const now = new Date();
    const captured: string[] = [];
    const errors: string[] = [];

    // Get all active trips
    const tripsQuery = query(collection(db, 'trips'), where('isActive', '==', true));
    const tripsSnap = await getDocs(tripsQuery);

    for (const tripDoc of tripsSnap.docs) {
        const trip = tripDoc.data() as TripDoc;
        const bookings = (trip.bookings ?? []) as BookingDoc[];

        // Calculate when auto-capture should happen (departure + 48h)
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

    return { captured, errors };
};

/** Vercel Cron handler - runs daily at 09:00 UTC */
export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('[AUTO-CAPTURE CRON] Starting...');
        const { captured, errors } = await runAutoCapture();
        console.log(`[AUTO-CAPTURE CRON] Done. Captured: ${captured.length}, Errors: ${errors.length}`);

        return NextResponse.json({
            success: true,
            captured: captured.length,
            capturedIds: captured,
            errors: errors.length,
            errorDetails: errors,
        });
    } catch (error) {
        console.error('[AUTO-CAPTURE CRON] Error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

/** Manual admin trigger */
export async function POST(req: NextRequest) {
    try {
        const { adminSecret } = await req.json();

        if (adminSecret !== process.env.ADMIN_SECRET) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
        }

        console.log('[AUTO-CAPTURE MANUAL] Starting...');
        const { captured, errors } = await runAutoCapture();
        console.log(`[AUTO-CAPTURE MANUAL] Done. Captured: ${captured.length}, Errors: ${errors.length}`);

        return NextResponse.json({
            success: true,
            captured: captured.length,
            capturedIds: captured,
            errors: errors.length,
            errorDetails: errors,
        });
    } catch (error) {
        console.error('[AUTO-CAPTURE MANUAL] Error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
