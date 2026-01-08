"use client"

import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import {SessionProvider} from "next-auth/react";
import {APIProvider} from "@/app/lib/devOverlay/apiContext";
import {DevOverlay} from "@/app/ui/devOverlay/devOverlay";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
      <SessionProvider>
          <APIProvider id={"api_provider"}>
              {children}
              <DevOverlay key={"dev_overlay"} />
          </APIProvider>
      </SessionProvider>
      </body>
    </html>
  );
}
