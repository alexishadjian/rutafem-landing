/**
 * POST /api/email/dispute
 *
 * Sends dispute notification email to admin.
 */

import { sendDisputeNotificationToAdmin } from '@/lib/emails';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const { tripId, orderId, disputedBy, disputerName, tripInfo } = await req.json();

        if (!tripId || !orderId || !disputedBy) {
            return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
        }

        await sendDisputeNotificationToAdmin({
            tripId,
            orderId,
            disputedBy,
            disputerName: disputerName || 'Utilisatrice',
            tripInfo: tripInfo || 'Non disponible',
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('dispute email error', error);
        return NextResponse.json({ error: 'Erreur envoi email' }, { status: 500 });
    }
}

