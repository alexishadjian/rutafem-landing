import Footer from '@/components/footer';
import GoogleAnalytics from '@/components/google-analytics';
import Header from '@/components/header';
import MicrosoftClarity from '@/components/microsoft-clarity';
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
                <MicrosoftClarity />
            </head>
            <body
                className={`${poppins.className} ${montserrat.variable} ${poppins.variable} ${staatliches.variable}`}
                suppressHydrationWarning
            >
                <ScrollState />
                <a
                    href="#main-content"
                    className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-[var(--dark-green)] focus:text-[var(--white)] focus:px-4 focus:py-2 focus:rounded-lg"
                >
                    Aller au contenu principal
                </a>
                <AuthProvider>
                    <Header />
                    <main id="main-content">{children}</main>
                    <Footer />
                </AuthProvider>
            </body>
        </html>
    );
}
