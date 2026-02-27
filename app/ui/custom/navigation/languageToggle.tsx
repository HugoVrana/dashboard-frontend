"use client";

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {Select, SelectContent, SelectItem, SelectTrigger,} from "@/app/ui/base/select";
import {getCookie} from "@/app/lib/cookieUtil";
import {GlobeIcon} from "lucide-react";
import {useDebugTranslations} from "@/app/lib/i18n/useDebugTranslations";

export function LanguageToggle() {
    const [locale, setLocale] = useState("en");
    const t = useDebugTranslations("lang");
    const router = useRouter();

    useEffect(() => {
        async function fetchLocale() {
            const locale = await getCookie("locale");
            setLocale(locale ?? "en");
        }
        fetchLocale();
    }, []);

    const changeLocale = (value: string | null) => {
        if (value === null) return;
        setLocale(value);
        document.cookie = `locale=${value};path=/;max-age=31536000`;
        window.dispatchEvent(new CustomEvent("locale-change", { detail: value }));
        router.refresh();
    };

    return (
        <Select value={locale} onValueChange={changeLocale}>
            <SelectTrigger className="size-9 w-auto border-0 p-0 justify-center hover:bg-muted rounded-lg">
                <GlobeIcon className="size-4" />
                <span className="sr-only">{t('change')}</span>
            </SelectTrigger>
            <SelectContent align="end">
                <SelectItem value="en">
                    {t("en")}
                </SelectItem>
                <SelectItem value="de">
                    {t("de")}
                </SelectItem>
            </SelectContent>
        </Select>
    );
}