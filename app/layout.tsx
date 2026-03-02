import type {Metadata} from 'next';
import {Inter} from "next/font/google";
import "./globals.css";
import {Analytics} from "@vercel/analytics/next";
import {geistMono, geistSans} from "@/app/ui/fonts";
import {getLocale, getMessages, getTimeZone} from "next-intl/server";
import {SpeedInsights} from "@vercel/speed-insights/next";
import {themeInitScript} from "@/app/ui/navigation/themeSwitchFix";
import {Providers} from "@/app/ui/providers";
import {Navbar} from "@/app/ui/navigation/navbar";
import {DevOverlay} from "@/app/ui/devOverlay/devOverlay";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
    title: {
        template: '%s | Acme Dashboard',
        default: 'Acme Dashboard',
    },
    description: 'The official Next.js Learn Dashboard built with App Router.',
    metadataBase: new URL('https://next-learn-dashboard.vercel.sh'),
};

export default async function RootLayout({children,} : {children: React.ReactNode;}) {
    const locale : string = await getLocale();
    const messages = await getMessages();
    const timeZone = await getTimeZone();

    return (
        <html lang={locale} className={inter.variable} suppressHydrationWarning>
            <head>
                <title>Dashboard</title>
                <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
            </head>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
            <Providers messages={messages} locale={locale} timeZone={timeZone}>
                <Navbar />
                {children}
                <DevOverlay key="dev_overlay" />
            </Providers>
            <Analytics />
            <SpeedInsights/>
            </body>
        </html>
    );
}