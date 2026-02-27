"use client"

import {createContext, type ReactNode, useContext, useEffect, useState} from "react"
import {getCookie, setCookie} from "@/app/lib/cookieUtil"

export type TranslationDebugContextType = {
    showKeys: boolean
    toggleShowKeys: () => void
}

export const TranslationDebugContext = createContext<TranslationDebugContextType>({
    showKeys: false,
    toggleShowKeys: () => {}
})

export function TranslationDebugProvider({ children }: { children: ReactNode }) {
    const [showKeys, setShowKeys] = useState(false)

    useEffect(() => {
        async function loadPreference() {
            if (process.env.NODE_ENV === "development") {
                const saved = await getCookie("dev-translation-show-keys")
                setShowKeys(saved === "true")
            }
        }
        loadPreference()
    }, [])

    const toggleShowKeys = async () => {
        const newValue = !showKeys
        setShowKeys(newValue)

        if (process.env.NODE_ENV === "development") {
            localStorage.setItem("dev-translation-show-keys", String(newValue))
            await setCookie("dev-translation-show-keys", String(newValue))
        }
    }

    return (
        <TranslationDebugContext.Provider value={{ showKeys, toggleShowKeys }}>
            {children}
        </TranslationDebugContext.Provider>
    )
}

export function useTranslationDebug() {
    return useContext(TranslationDebugContext)
}
