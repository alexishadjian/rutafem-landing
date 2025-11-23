import { stripe } from '@/lib/stripe';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const { accountId } = await req.json();
        if (!accountId) {
            return NextResponse.json({ error: 'accountId requis' }, { status: 400 });
        }

        // delete only the stripe account on the connect side
        const deleted = await stripe.accounts.del(accountId);
        return NextResponse.json({ deleted: deleted.deleted === true, id: deleted.id });
    } catch (error: unknown) {
        console.error('unlink error', error);
        const message = error instanceof Error ? error.message : 'Erreur serveur';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
