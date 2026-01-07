import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const sessionId = searchParams.get('id');
        if (!sessionId) return NextResponse.json({ error: 'id manquant' }, { status: 400 });
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        return NextResponse.json(session);
    } catch (error) {
        console.error('session retrieve error', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}


