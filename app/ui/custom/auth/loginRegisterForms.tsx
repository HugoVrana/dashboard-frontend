"use client";

import {Suspense, useContext, useState} from "react";
import {Button} from "@/app/ui/base/button";
import LoginForm from "@/app/ui/custom/auth/loginForm";
import RegisterForm from "@/app/ui/custom/auth/registerForm";
import AcmeLogo from "@/app/ui/custom/acmeLogo";
import {ThemeContext} from "@/app/lib/theme/themeContext";

export default function LoginRegisterForm() {
    const [pageState, setPageState] = useState("login");
    const { isDark } = useContext(ThemeContext);

    const colors = {
        container: isDark ? "bg-zinc-900 shadow-zinc-950" : "bg-white shadow-gray-200",
        buttonActive: "bg-blue-600 text-white",
        buttonInactive: isDark ? "bg-zinc-800 text-zinc-300" : "bg-gray-200 text-gray-700",
        footer: isDark ? "text-zinc-500" : "text-gray-500",
    };

    return (
        <Suspense>
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="relative z-10 flex h-20 w-full items-end rounded-lg bg-blue-500 p-3 md:h-36">
                    <div className="w-32 text-white md:w-36">
                        <AcmeLogo />
                    </div>
                </div>
                <div className={`w-full max-w-md p-8 rounded-lg shadow-md ${colors.container}`}>
                    <div className="flex gap-2 mb-6">
                        <Button
                            onClick={() => setPageState("login")}
                            className={`flex-1 ${pageState === "login" ? colors.buttonActive : colors.buttonInactive}`}
                        >
                            Login
                        </Button>
                        <Button
                            onClick={() => setPageState("register")}
                            className={`flex-1 ${pageState === "register" ? colors.buttonActive : colors.buttonInactive}`}
                        >
                            Register
                        </Button>
                    </div>
                    {pageState === "login" ? (
                        <LoginForm/>
                    ) : (
                        <RegisterForm/>
                    )}
                </div>
                <div className={`mt-4 text-center text-sm ${colors.footer}`}>
                    &copy; {new Date().getFullYear()} Acme. All rights reserved.
                </div>
            </div>
        </Suspense>
    )
}