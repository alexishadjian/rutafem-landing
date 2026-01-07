import { stripe } from '@/lib/stripe';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const { accountId, returnUrl } = await req.json();
        if (!accountId || !returnUrl) {
            return NextResponse.json({ error: 'accountId et returnUrl requis' }, { status: 400 });
        }

        const link = await stripe.accountLinks.create({
            account: accountId,
            refresh_url: `${returnUrl}?refresh=1`,
            return_url: returnUrl,
            type: 'account_onboarding',
            collect: 'eventually_due',
        });

        // force french language
        const url = new URL(link.url);
        url.searchParams.set('locale', 'fr');
        return NextResponse.json({ url: url.toString() });
    } catch (error) {
        console.error('account-link error', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
