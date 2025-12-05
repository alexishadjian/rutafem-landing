/**
 * POST /api/email/cancellation
 *
 * Sends cancellation notification email.
 * - If driver cancels: send to all passengers
 * - If passenger cancels: send to driver
 */

import { sendCancellationEmail } from '@/lib/emails';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const {
            recipientEmail,
            recipientName,
            cancellerName,
            cancellerRole,
            tripId,
            departureCity,
            arrivalCity,
            departureDate,
            departureTime,
            departureAddress,
            arrivalAddress,
            pricePerSeat,
        } = await req.json();

        if (!recipientEmail || !cancellerRole) {
            return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
        }

        await sendCancellationEmail({
            recipientEmail,
            recipientName: recipientName || 'Utilisatrice',
            cancellerName: cancellerName || 'Une utilisatrice',
            cancellerRole,
            trip: {
                tripId,
                departureCity,
                arrivalCity,
                departureDate,
                departureTime,
                departureAddress,
                arrivalAddress,
                pricePerSeat,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('cancellation email error', error);
        return NextResponse.json({ error: 'Erreur envoi email' }, { status: 500 });
    }
}

