"use client"

import { Suspense, useState } from "react";
import { Button } from "@/app/ui/base/button";
import AcmeLogo from "@/app/ui/custom/acmeLogo";
import {Card, CardContent, CardHeader} from "../../base/card";
import LoginForm from "@/app/ui/custom/auth/loginForm";
import RegisterForm from "@/app/ui/custom/auth/registerForm";
import {useTranslations} from "next-intl";

export default function LoginRegisterCard() {
    const [pageState, setPageState] = useState<"login" | "register">("login");
    const t = useTranslations("auth.loginRegisterForm");

    return (
        <Suspense>
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                {/* Logo Header */}
                <div className="relative z-10 flex h-20 w-full max-w-md items-end rounded-t-lg bg-blue-500 p-3 md:h-36">
                    <div className="w-32 text-white md:w-36">
                        <AcmeLogo />
                    </div>
                </div>

                {/* Main Card */}
                <Card className="w-full max-w-md rounded-t-none border-t-0">
                    <CardHeader className="pb-4">
                        {/* Tab Switcher */}
                        <div className="flex gap-1 p-1 rounded-lg">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPageState("login")}
                                className={`flex-1 ${
                                    pageState === "login"
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                {t('login')}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPageState("register")}
                                className={`flex-1 ${
                                    pageState === "register"
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                {t('register')}
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent>
                        {pageState === "login" ? (
                            <LoginForm/>
                        ) : (
                            <RegisterForm />
                        )}
                    </CardContent>
                </Card>
                <p className="mt-4 text-center text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} {t('acmeReserved')}
                </p>
            </div>
        </Suspense>
    );
}