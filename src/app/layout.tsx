import Header from "@/components/header";
import Footer from "@/components/footer";
import ScrollState from "@/components/ScrollState";
import { Favicon } from '@/images';
import GoogleAnalytics from '@/components/google-analytics';



// EXPORT METADATA
import type { Metadata } from "next";
export const metadata: Metadata = {
    title: "Covoiturage entre femmes - Sécurité et convivialité avec RutaFem",
    description: "Meta description: Covoiturage entre femmes avec RutaFem : sécurité, convivialité et trajets partagés entre femmes pour voyager en toute sécurité.",
    keywords: ["covoiturage", "femmes", "sécurité", "convivialité", "trajets partagés", "voyage", "RutaFem"],
    icons: [
        {
            rel: "icon",
            type: "image/png",
            url: Favicon.src,
        },
    ],
};

// FONT IMPORT
import { Poppins } from "next/font/google";
export const poppins = Poppins({
    weight: ['300', '400', '500', '600', '700'],
    style: ['normal', 'italic'],
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-poppins'
});

import { Montserrat } from "next/font/google";
export const montserrat = Montserrat({
    subsets: ['latin'],
    style: ['normal', 'italic'],
    display: 'swap',
    variable: '--font-montserrat'
});

import { Staatliches } from "next/font/google";
export const staatliches = Staatliches({
    weight: '400',
    subsets: ['latin'],
    style: ['normal'],
    display: 'swap',
    variable: '--font-staatliches'
});


// CSS IMPORT
import "./globals.css";


export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="fr">
            <head>
                <GoogleAnalytics />
            </head>
            <ScrollState />
            <body className={`${poppins.className} ${montserrat.variable} ${poppins.variable} ${staatliches.variable}`} suppressHydrationWarning>
                <Header />
                <main>
                    {children}
                </main>
                <Footer />
            </body>
        </html>
    );
}