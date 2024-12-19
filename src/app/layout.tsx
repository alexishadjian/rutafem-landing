import Header from "@/components/header";
import Footer from "@/components/footer";
import ScrollState from "@/components/ScrollState";


// EXPORT METADATA
import type { Metadata } from "next";
export const metadata: Metadata = {
    title: "MDS Startup Landing",
    description: "A landing page for a startup",
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


export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
    return (
        <html lang="fr">
            <ScrollState />
            <body className={`${poppins.className} ${montserrat.variable} ${poppins.variable} ${staatliches.variable}`}>
                <Header />
                <main>
                    {children}
                </main>
                <Footer />
            </body>
        </html>
    );
}