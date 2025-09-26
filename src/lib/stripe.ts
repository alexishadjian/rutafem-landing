import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY_TEST as string;

if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY_TEST manquant dans les variables d\'environnement');
}

export const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2024-06-20',
    appInfo: { name: 'RutaFem', url: 'https://rutafem.com' },
});


