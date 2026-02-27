"use client"

import {useTranslations} from "next-intl"
import {useTranslationDebug} from "@/app/lib/i18n/translationDebugContext"

export function useDebugTranslations(namespace?: string) {
    const t = useTranslations(namespace)
    const { showKeys } = useTranslationDebug()

    if (showKeys) {
        return (key: string) => `[${namespace ? `${namespace}.` : ""}${key}]`
    }

    return t
}
