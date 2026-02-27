"use client"

import {type Context, createContext, type ReactNode, useEffect, useState} from "react"

export type ThemeContextType = {
    isDark: boolean
    toggleTheme: () => void
}

export const ThemeContext: Context<ThemeContextType> = createContext<ThemeContextType>({
    isDark: false,
    toggleTheme: () => {}
})

const THEME_STORAGE_KEY = "theme-mode"

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [isDark, setIsDark] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        const saved = localStorage.getItem(THEME_STORAGE_KEY)

        if (saved) {
            setIsDark(saved === "dark")
        } else {
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
            setIsDark(prefersDark)
        }

        setMounted(true)
    }, [])

    useEffect(() => {
        if (!mounted) return

        if (isDark) {
            document.documentElement.classList.add("dark")
        } else {
            document.documentElement.classList.remove("dark")
        }

        localStorage.setItem(THEME_STORAGE_KEY, isDark ? "dark" : "light")
    }, [isDark, mounted])

    const toggleTheme = () => {
        setIsDark(prev => !prev)
    }

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}
