"use client"

import { Inter } from "next/font/google";
import "./globals.css";
import {SessionProvider} from "next-auth/react";
import {APIProvider} from "@/app/lib/devOverlay/apiContext";
import {DevOverlay} from "@/app/ui/custom/devOverlay/devOverlay";
import {Analytics} from "@vercel/analytics/next";
import {geistMono, geistSans} from "@/app/ui/fonts";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
        <head>
            <title>Dashboard</title>
        </head>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SessionProvider>
            <APIProvider id={"api_provider"}>
                {children}
                <DevOverlay key={"dev_overlay"} />
            </APIProvider>
        </SessionProvider>
        <Analytics />
        </body>
    </html>
  );
}
