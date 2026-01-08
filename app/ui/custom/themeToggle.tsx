"use client"

import { useContext } from "react"
import { Sun, Moon } from "lucide-react"
import { Switch } from "@/app/ui/base/switch"
import { ThemeContext } from "@/app/lib/theme/themeContext"

export function ThemeToggle() {
    const { isDark, toggleTheme } = useContext(ThemeContext);

    return (
        <div className="flex items-center gap-2">
            <Sun className="size-4 text-muted-foreground" />
            <Switch
                checked={isDark}
                onCheckedChange={toggleTheme}
                aria-label="Toggle dark mode"
            />
            <Moon className="size-4 text-muted-foreground" />
        </div>
    )
}
