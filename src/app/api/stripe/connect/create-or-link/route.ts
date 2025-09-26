import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const { uid, existingAccountId, email } = await req.json();
        if (!uid) {
            return NextResponse.json({ error: 'uid requis' }, { status: 400 });
        }

        if (existingAccountId) {
            return NextResponse.json({ accountId: existingAccountId as string });
        }

        const account = await stripe.accounts.create({
            type: 'express',
            country: 'FR',
            email: (email as string) || undefined,
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true },
            },
            business_type: 'individual',
            default_currency: 'eur',
            business_profile: {
                url: 'https://rutafem.com',
                mcc: '4789',
                product_description: 'Covoiturage entre femmes via RutaFem (partage de frais)',
            },
        });

        return NextResponse.json({ accountId: account.id });
    } catch (error) {
        console.error('create-or-link error', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}


