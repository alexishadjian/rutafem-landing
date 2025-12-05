/**
 * POST /api/email/booking-created
 *
 * Sends booking confirmation emails to passenger and driver.
 * Called after a booking is successfully created.
 */

import { sendBookingConfirmationToPassenger, sendNewPassengerNotificationToDriver } from '@/lib/emails';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const {
            passengerEmail,
            passengerName,
            driverEmail,
            driverName,
            tripId,
            orderId,
            departureCity,
            arrivalCity,
            departureDate,
            departureTime,
            departureAddress,
            arrivalAddress,
            pricePerSeat,
        } = await req.json();

        if (!passengerEmail || !driverEmail || !tripId) {
            return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
        }

        const tripInfo = {
            tripId,
            departureCity,
            arrivalCity,
            departureDate,
            departureTime,
            departureAddress,
            arrivalAddress,
            pricePerSeat,
        };

        const emailParams = {
            passengerEmail,
            passengerName,
            driverEmail,
            driverName,
            trip: tripInfo,
            orderId,
        };

        // Send both emails in parallel
        await Promise.all([
            sendBookingConfirmationToPassenger(emailParams),
            sendNewPassengerNotificationToDriver(emailParams),
        ]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('booking-created email error', error);
        return NextResponse.json({ error: 'Erreur envoi email' }, { status: 500 });
    }
}

