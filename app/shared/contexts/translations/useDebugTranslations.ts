"use client"

import {useTranslations} from "next-intl"
import {useTranslationDebug} from "@/app/shared/contexts/translations/translationDebugContext";

export function useDebugTranslations(namespace?: string): (key: string) => string {
    const t = useTranslations(namespace)
    const { showKeys } = useTranslationDebug()

    if (showKeys) {
        return (key: string) => `[${namespace ? `${namespace}.` : ""}${key}]`
    }

    return (key: string) => t(key)
}

