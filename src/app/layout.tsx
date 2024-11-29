// EXPORT METADATA
import type { Metadata } from "next";
export const metadata: Metadata = {
    title: "MDS Startup Landing",
    description: "A landing page for a startup",
};

// FONT IMPORT
import { Lato } from "next/font/google";
const lato = Lato({
    weight: ['300', '400', '700'],
    style: ['normal', 'italic'],
    subsets: ['latin'],
    display: 'swap',
});

// CSS IMPORT
import "./globals.css";


export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
    return (
        <html lang="fr">
            <body className={lato.className}>
                {children}
            </body>
        </html>
    );
}