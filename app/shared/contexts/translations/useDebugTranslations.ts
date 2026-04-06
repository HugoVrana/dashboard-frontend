"use client"

import {useCallback} from "react";
import {useTranslations} from "next-intl"
import {useTranslationDebug} from "@/app/shared/contexts/translations/translationDebugContext";

type TranslationValues = Record<string, string | number | boolean | Date | null | undefined>;

export function useDebugTranslations(namespace?: string): (key: string, values?: TranslationValues) => string {
    const t = useTranslations(namespace)
    const { showKeys } = useTranslationDebug()

    return useCallback(
        (key: string, values?: TranslationValues) => {
            if (showKeys) {
                return `[${namespace ? `${namespace}.` : ""}${key}]`;
            }

            return t(key, values);
        },
        [namespace, showKeys, t]
    );
}
