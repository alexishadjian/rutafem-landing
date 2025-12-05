/**
 * GET /api/cron/send-confirmation-reminders
 *
 * Vercel Cron job that runs daily to send confirmation reminder emails
 * for trips that happened yesterday (departure date = yesterday).
 *
 * This route is protected by CRON_SECRET environment variable.
 */

import { sendConfirmationReminderEmail } from '@/lib/emails';
import { BASE_URL } from '@/lib/resend';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for this job

// Simple in-memory Firebase client imports (no admin SDK)
// We need to use fetch to call our own API or access Firestore differently
// Since we can't use Firebase client SDK in API routes without auth,
// we'll use the REST API approach

const FIRESTORE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

type FirestoreTrip = {
    name: string;
    fields: {
        departureCity: { stringValue: string };
        arrivalCity: { stringValue: string };
        departureDate: { stringValue: string };
        departureTime: { stringValue: string };
        departureAddress: { stringValue: string };
        arrivalAddress: { stringValue: string };
        pricePerSeat: { integerValue: string };
        driverId: { stringValue: string };
        bookings?: {
            arrayValue: {
                values?: {
                    mapValue: {
                        fields: {
                            oderId: { stringValue: string };
                            participantId: { stringValue: string };
                            participantEmail?: { stringValue: string };
                            participantName?: { stringValue: string };
                            driverEmail?: { stringValue: string };
                            driverName?: { stringValue: string };
                            status: { stringValue: string };
                        };
                    };
                }[];
            };
        };
    };
};

export async function GET(req: NextRequest) {
    try {
        // Verify cron secret (Vercel sends this header)
        const authHeader = req.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Calculate yesterday's date in YYYY-MM-DD format (matching Firestore format)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const year = yesterday.getFullYear();
        const month = String(yesterday.getMonth() + 1).padStart(2, '0');
        const day = String(yesterday.getDate()).padStart(2, '0');
        const yesterdayStr = `${year}-${month}-${day}`;

        console.log(`[CRON] Looking for trips from: ${yesterdayStr}`);
        console.log(`[CRON] Project ID: ${FIRESTORE_PROJECT_ID}`);

        // Query Firestore REST API for trips with this departure date
        const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT_ID}/databases/(default)/documents:runQuery`;
        console.log(`[CRON] Firestore URL: ${firestoreUrl}`);

        const queryResponse = await fetch(firestoreUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                structuredQuery: {
                    from: [{ collectionId: 'trips' }],
                    where: {
                        fieldFilter: {
                            field: { fieldPath: 'departureDate' },
                            op: 'EQUAL',
                            value: { stringValue: yesterdayStr },
                        },
                    },
                },
            }),
        });

        console.log(`[CRON] Firestore response status: ${queryResponse.status}`);

        if (!queryResponse.ok) {
            const errorText = await queryResponse.text();
            console.error('[CRON] Firestore query failed:', errorText);
            return NextResponse.json({ error: 'Firestore query failed', details: errorText }, { status: 500 });
        }

        const results = (await queryResponse.json()) as { document?: FirestoreTrip }[];
        console.log(`[CRON] Raw results count: ${results.length}`);
        console.log(`[CRON] Raw results:`, JSON.stringify(results, null, 2));

        const trips = results.filter((r) => r.document).map((r) => r.document!);

        console.log(`[CRON] Found ${trips.length} trips from yesterday`);

        let emailsSent = 0;

        for (const trip of trips) {
            const tripId = trip.name.split('/').pop()!;
            const fields = trip.fields;

            // Get bookings that are still 'authorized' (need confirmation)
            const bookingsArray = fields.bookings?.arrayValue?.values ?? [];
            const authorizedBookings = bookingsArray
                .map((b) => b.mapValue.fields)
                .filter((b) => b.status.stringValue === 'authorized');

            if (authorizedBookings.length === 0) {
                console.log(`[CRON] Trip ${tripId}: No authorized bookings, skipping`);
                continue;
            }

            const tripInfo = {
                tripId,
                departureCity: fields.departureCity.stringValue,
                arrivalCity: fields.arrivalCity.stringValue,
                departureDate: fields.departureDate.stringValue,
                departureTime: fields.departureTime.stringValue,
                departureAddress: fields.departureAddress.stringValue,
                arrivalAddress: fields.arrivalAddress.stringValue,
                pricePerSeat: Number(fields.pricePerSeat.integerValue),
            };

            // Send emails using contact info stored in booking (no need to query users collection)
            for (const booking of authorizedBookings) {
                const orderId = booking.oderId.stringValue;
                const confirmUrl = `${BASE_URL}/trip/${tripId}/confirm?orderId=${orderId}`;

                // Get emails from booking (stored at creation time)
                const driverEmail = booking.driverEmail?.stringValue;
                const driverName = booking.driverName?.stringValue || 'Conductrice';
                const passengerEmail = booking.participantEmail?.stringValue;
                const passengerName = booking.participantName?.stringValue || 'Voyageuse';

                console.log(`[CRON] Booking ${orderId}: driver=${driverEmail || 'N/A'}, passenger=${passengerEmail || 'N/A'}`);

                // Send to driver
                if (driverEmail) {
                    await sendConfirmationReminderEmail({
                        email: driverEmail,
                        name: driverName,
                        role: 'driver',
                        trip: tripInfo,
                        orderId,
                        confirmUrl,
                    });
                    emailsSent++;
                    console.log(`[CRON] ✅ Email sent to driver: ${driverEmail}`);
                } else {
                    console.log(`[CRON] ❌ No driverEmail in booking ${orderId}`);
                }

                // Send to passenger
                if (passengerEmail) {
                    await sendConfirmationReminderEmail({
                        email: passengerEmail,
                        name: passengerName,
                        role: 'passenger',
                        trip: tripInfo,
                        orderId,
                        confirmUrl,
                    });
                    emailsSent++;
                    console.log(`[CRON] ✅ Email sent to passenger: ${passengerEmail}`);
                } else {
                    console.log(`[CRON] ❌ No participantEmail in booking ${orderId}`);
                }
            }

            console.log(`[CRON] Trip ${tripId}: Processed ${authorizedBookings.length} bookings`);
        }

        console.log(`[CRON] Completed. Total emails sent: ${emailsSent}`);
        return NextResponse.json({ success: true, emailsSent });
    } catch (error) {
        console.error('[CRON] Error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}

