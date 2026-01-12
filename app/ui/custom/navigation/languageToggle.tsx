"use client";

import { useEffect, useState } from "react";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
} from "@/app/ui/base/select";
import { getCookie, setCookie } from "@/app/lib/cookieUtil";
import { GlobeIcon } from "lucide-react";
import {cn} from "@/app/lib/utils";

export function LanguageToggle() {
    const [locale, setLocale] = useState("en");

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
        setCookie("locale", value);
        window.dispatchEvent(new CustomEvent("locale-change", { detail: value })); // to trigger dev overlay
    };

    return (
        <Select value={locale} onValueChange={changeLocale}>
            <SelectTrigger className={cn}>
                <GlobeIcon className="size-4" />
                <span className="sr-only">Change language</span>
            </SelectTrigger>
            <SelectContent align="end">
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
            </SelectContent>
        </Select>
    );
}