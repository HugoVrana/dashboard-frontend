"use client";

import {SessionProvider} from "next-auth/react";
import {ThemeProvider} from "@/app/shared/contexts/theme/themeContext";
import {APIProvider} from "@/app/shared/components/devOverlay/apiContext";
import {TranslationDebugProvider} from "@/app/shared/contexts/translations/translationDebugContext";
import {NextIntlClientProvider} from "next-intl";
import {ProvidersProps} from "@/app/shared/models/providersProps";

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