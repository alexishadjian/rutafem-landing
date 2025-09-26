import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const { accountId } = await req.json();

        if (!accountId) return NextResponse.json({ error: 'accountId requis' }, { status: 400 });

        const account = await stripe.accounts.retrieve(accountId);
        return NextResponse.json({
            accountId: account.id,
            charges_enabled: account.charges_enabled,
            payouts_enabled: account.payouts_enabled,
            requirements: account.requirements,
        });
    } catch (error) {
        console.error('status error', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}