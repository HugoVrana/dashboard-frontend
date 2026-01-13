import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { geistMono, geistSans } from "@/app/ui/fonts";
import { themeInitScript } from "@/app/ui/custom/navigation/themeSwitchFix";
import { Navbar } from "@/app/ui/custom/navigation/navbar";
import { DevOverlay } from "@/app/ui/custom/devOverlay/devOverlay";
import { Providers } from "./providers";
import {getLocale, getMessages, getTimeZone} from "next-intl/server";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

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
            </body>
        </html>
    );
}