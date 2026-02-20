"use client"

import { useTranslationDebug } from "@/app/lib/i18n/translationDebugContext"
import { Badge } from "@/app/ui/base/badge"
import { Button } from "@/app/ui/base/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/ui/base/card"
import { Label } from "@/app/ui/base/label"
import {useEffect, useState} from "react";
import {getCookie} from "@/app/lib/cookieUtil";

export default function TranslationOverlay() {
    const { showKeys, toggleShowKeys } = useTranslationDebug()
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
                    <CardTitle className="text-sm font-medium text-white">Translation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex gap-1 p-1 bg-gray-700 rounded-lg">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleShowKeys}
                            className={`flex-1 ${
                                !showKeys
                                    ? "bg-blue-600 text-white hover:bg-blue-700 hover:text-white"
                                    : "text-gray-300 hover:bg-gray-600 hover:text-white"
                            }`}
                        >
                            Translations
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleShowKeys}
                            className={`flex-1 ${
                                showKeys
                                    ? "bg-orange-600 text-white hover:bg-orange-700 hover:text-white"
                                    : "text-gray-300 hover:bg-gray-600 hover:text-white"
                            }`}
                        >
                            Keys
                        </Button>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Label className="text-xs text-gray-400">Mode:</Label>
                            <Badge className={showKeys ? "bg-orange-600 hover:bg-orange-600" : "bg-blue-600 hover:bg-blue-600"}>
                                {showKeys ? "Showing Keys" : "Showing Translations"}
                            </Badge>
                        </div>
                        <p className="text-xs text-gray-400">
                            {showKeys
                                ? "Labels display as [namespace.key]"
                                : "Labels display translated text"}
                        </p>
                    </div>
                </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-white">Language</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-xs text-gray-400 break-all">{locale}</p>
                </CardContent>
            </Card>
        </div>
    )
}
