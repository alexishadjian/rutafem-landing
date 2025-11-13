import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
// Aucun accès Firestore ici pour éviter les erreurs de permissions côté serveur

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const { accountId } = await req.json();
        if (!accountId) {
            return NextResponse.json({ error: 'accountId requis' }, { status: 400 });
        }

        // Supprimer uniquement le compte Stripe côté Connect
        const deleted = await stripe.accounts.del(accountId);
        return NextResponse.json({ deleted: deleted.deleted === true, id: deleted.id });
    } catch (error: unknown) {
        console.error('unlink error', error);
        const message = error instanceof Error ? error.message : 'Erreur serveur';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}