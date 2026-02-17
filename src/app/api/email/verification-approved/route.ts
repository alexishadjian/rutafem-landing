/**
 * POST /api/email/verification-approved
 *
 * Sends an email to the user when their identity or driver license
 * verification is approved by an admin.
 */

import { sendVerificationApprovedEmail } from '@/lib/emails';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const { email, firstName, type } = await req.json();

        if (!email || !firstName || !type) {
            return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
        }

        if (type !== 'identity' && type !== 'driver') {
            return NextResponse.json({ error: 'Type invalide' }, { status: 400 });
        }

        await sendVerificationApprovedEmail({ email, firstName, type });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('verification-approved email error', error);
        return NextResponse.json({ error: 'Erreur envoi email' }, { status: 500 });
    }
}
