import Footer from '@/components/footer';
import GoogleAnalytics from '@/components/google-analytics';
import Header from '@/components/header';
import ScrollState from '@/components/ScrollState';
import { AuthProvider } from '@/contexts/AuthContext';
import { Favicon } from '@/images';

// EXPORT METADATA
import type { Metadata } from 'next';
export const metadata: Metadata = {
    title: 'RutaFem | Covoiturage entre femmes',
    description:
        'Meta description: Covoiturage entre femmes avec RutaFem : sécurité, convivialité et trajets partagés entre femmes pour voyager en toute sécurité.',
    keywords: [
        'covoiturage',
        'femmes',
        'sécurité',
        'convivialité',
        'trajets partagés',
        'voyage',
        'RutaFem',
    ],
    openGraph: {
        title: 'RutaFem | Covoiturage entre femmes',
        description:
            'Meta description: Covoiturage entre femmes avec RutaFem : sécurité, convivialité et trajets partagés entre femmes pour voyager en toute sécurité.',
    },
    icons: [
        {
            rel: 'icon',
            type: 'image/png',
            url: Favicon.src,
        },
    ],
};

// FONT IMPORT
import { Poppins } from 'next/font/google';
export const poppins = Poppins({
    weight: ['300', '400', '500', '600', '700'],
    style: ['normal', 'italic'],
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-poppins',
});

import { Montserrat } from 'next/font/google';
export const montserrat = Montserrat({
    subsets: ['latin'],
    style: ['normal', 'italic'],
    display: 'swap',
    variable: '--font-montserrat',
});

import { Staatliches } from 'next/font/google';
export const staatliches = Staatliches({
    weight: '400',
    subsets: ['latin'],
    style: ['normal'],
    display: 'swap',
    variable: '--font-staatliches',
});

// CSS IMPORT
import './globals.css';

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="fr">
            <head>
                <GoogleAnalytics />
            </head>
            <ScrollState />
            <body
                className={`${poppins.className} ${montserrat.variable} ${poppins.variable} ${staatliches.variable}`}
                suppressHydrationWarning
            >
                <AuthProvider>
                    <Header />
                    <main>{children}</main>
                    <Footer />
                </AuthProvider>
            </body>
        </html>
    );
}
