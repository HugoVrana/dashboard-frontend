"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/app/lib/theme/themeContext";
import { APIProvider } from "@/app/lib/devOverlay/apiContext";
import { NextIntlClientProvider } from "next-intl";

type Props = {
    children: React.ReactNode;
    messages: any;
    locale: string;
    timeZone : string;
};

export function Providers({ children, messages, locale, timeZone }: Props) {
    console.log("Rendering Providers with locale:", locale);
    return (
        <SessionProvider>
            <ThemeProvider>
                <APIProvider id="api_provider">
                    <NextIntlClientProvider messages={messages} locale={locale} timeZone={timeZone}>
                        {children}
                    </NextIntlClientProvider>
                </APIProvider>
            </ThemeProvider>
        </SessionProvider>
    );
}