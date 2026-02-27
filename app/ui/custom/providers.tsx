"use client";

import {SessionProvider} from "next-auth/react";
import {ThemeProvider} from "@/app/lib/theme/themeContext";
import {APIProvider} from "@/app/lib/devOverlay/apiContext";
import {TranslationDebugProvider} from "@/app/lib/i18n/translationDebugContext";
import {NextIntlClientProvider} from "next-intl";
import {ProvidersProps} from "@/app/models/ui/providersProps";

export function Providers(p : ProvidersProps) {
    console.log("Rendering Providers with locale:", p.locale);
    return (
        <SessionProvider basePath="/api/auth" refetchOnWindowFocus={true} refetchWhenOffline={false}>
            <ThemeProvider>
                <APIProvider id="api_provider">
                    <TranslationDebugProvider>
                        <NextIntlClientProvider messages={p.messages} locale={p.locale} timeZone={p.timeZone}>
                            {p.children}
                        </NextIntlClientProvider>
                    </TranslationDebugProvider>
                </APIProvider>
            </ThemeProvider>
        </SessionProvider>
    );
}