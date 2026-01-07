import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY as string;

if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY manquant dans les variables d\'environnement');
}

export const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2025-10-29.clover',
    appInfo: { name: 'RutaFem', url: 'https://rutafem.com' },
});