"use client";

import { useEffect, useState } from "react";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
} from "@/app/ui/base/select";
import { getCookie } from "@/app/lib/cookieUtil";
import { GlobeIcon } from "lucide-react";
import {useTranslations} from "next-intl";

export function LanguageToggle() {
    const [locale, setLocale] = useState("en");
    const t = useTranslations("lang");

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
        window.location.reload();
    };

    return (
        <Select value={locale} onValueChange={changeLocale}>
            <SelectTrigger className="size-9 w-auto border-0 p-0 justify-center hover:bg-muted rounded-lg">
                <GlobeIcon className="size-4" />
                <span className="sr-only">Change language</span>
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