"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/ui/base/card";
import { getCookie } from "@/app/lib/cookieUtil";
import { useEffect, useState } from "react";

export default function EnvOverlay() {
    const [locale, setLocale] = useState("en");

    useEffect(() => {
        async function fetchLocale() {
            const locale : string | undefined = await getCookie("locale");
            setLocale(locale ?? "en");
        }

        fetchLocale();

        // there is an event listener on language toggle to update the locale
        const handleLocaleChange = (e: CustomEvent) => setLocale(e.detail);
        window.addEventListener("locale-change", handleLocaleChange as EventListener);

        return () => {
            window.removeEventListener("locale-change", handleLocaleChange as EventListener);
        };
    }, []);

    return (
        <div className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-white">Language</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-xs text-gray-400 break-all">{locale}</p>
                </CardContent>
            </Card>
        </div>
    );
}