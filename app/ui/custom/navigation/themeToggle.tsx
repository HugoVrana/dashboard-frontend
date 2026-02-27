"use client"

import {useEffect, useState} from "react"
import {Moon, Sun} from "lucide-react"
import {Button} from "@/app/ui/base/button";

export function ThemeToggle() {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        setIsDark(document.documentElement.classList.contains("dark"));
    }, []);

    const toggleTheme = () => {
        const newIsDark = !isDark;
        setIsDark(newIsDark);
        document.documentElement.classList.toggle("dark", newIsDark);
        localStorage.setItem("theme-mode", newIsDark ? "dark" : "light");
    };

    return (
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}