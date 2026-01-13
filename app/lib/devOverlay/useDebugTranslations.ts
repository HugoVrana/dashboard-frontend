"use client"

import { useTranslations } from "next-intl"
import { useTranslationDebug } from "@/app/lib/devOverlay/translationDebugContext"

export function useDebugTranslations(namespace?: string) {
    const t = useTranslations(namespace)
    const { showKeys } = useTranslationDebug()

    if (showKeys) {
        return (key: string) => `[${namespace ? `${namespace}.` : ""}${key}]`
    }

    return t
}
