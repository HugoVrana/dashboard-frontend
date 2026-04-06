"use client"

import {Suspense, useState} from "react";
import {useSearchParams} from "next/navigation";
import {useDebugTranslations} from "@/app/shared/contexts/translations/useDebugTranslations";
import {Button, Card, CardContent, CardHeader} from "@hugovrana/dashboard-frontend-shared";
import AcmeLogo from "@/app/shared/components/acmeLogo";
import LoginForm from "@/app/auth/components/loginRegister/loginForm";
import RegisterForm from "@/app/auth/components/loginRegister/registerForm";
import TotpVerifyStep from "@/app/auth/components/loginRegister/totpVerifyStep";
import TotpSetupStep from "@/app/auth/components/loginRegister/totpSetupStep";
import {LoginRegisterFormPageState} from "@/app/auth/models/components/loginRegisterFormPageState";

function LoginRegisterCardInner() {
    const [pageState, setPageState] = useState<LoginRegisterFormPageState>("login");
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
    const requestId = searchParams.get("request_id") ?? undefined;
    const t = useDebugTranslations("auth.loginRegisterForm");

    const handleComplete = () => {
        window.location.href = callbackUrl;
    };

    const showTabs = pageState === "login" || pageState === "register";

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="relative z-10 flex h-20 w-full max-w-md items-end rounded-t-lg bg-blue-500 p-3 md:h-36">
                <div className="w-32 text-white md:w-36">
                    <AcmeLogo/>
                </div>
            </div>

            <Card className="w-full max-w-md rounded-t-none border-t-0">
                {showTabs && (
                    <CardHeader className="pb-4">
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
                                {t("login")}
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
                                {t("register")}
                            </Button>
                        </div>
                    </CardHeader>
                )}

                <CardContent className={showTabs ? "" : "pt-6"}>
                    {pageState === "login" && (
                        <LoginForm
                            onSuccess={handleComplete}
                            onMfaRequired={() => setPageState("mfa")}
                            requestId={requestId}
                        />
                    )}
                    {pageState === "register" && (
                        <RegisterForm
                            onComplete={() => setPageState("totp-setup")}
                        />
                    )}
                    {pageState === "mfa" && (
                        <TotpVerifyStep
                            onComplete={handleComplete}
                            onBack={() => setPageState("login")}
                        />
                    )}
                    {pageState === "totp-setup" && (
                        <TotpSetupStep
                            onComplete={handleComplete}
                            onSkip={handleComplete}
                        />
                    )}
                </CardContent>
            </Card>

            <p className="mt-4 text-center text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} {t("acmeReserved")}
            </p>
        </div>
    );
}

export default function LoginRegisterCard() {
    return (
        <Suspense>
            <LoginRegisterCardInner/>
        </Suspense>
    );
}
