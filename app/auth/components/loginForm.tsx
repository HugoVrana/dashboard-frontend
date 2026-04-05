"use client";

import {ArrowRightIcon, AtSign, KeyIcon, Loader2, ShieldAlert} from "lucide-react";
import {signIn} from "next-auth/react";
import {FormEvent, useContext, useState} from "react";
import {ApiContext} from "@/app/shared/components/devOverlay/apiContext";
import {getDashboardAuthLocalUrl, getDashboardAuthRenderUrl} from "@/app/auth/dashboardAuthApiContext";
import {loginAction} from "@/app/auth/actions";
import {useDebugTranslations} from "@/app/shared/contexts/translations/useDebugTranslations";
import {Button, CardTitle, Input, Label} from "@hugovrana/dashboard-frontend-shared";

interface LoginFormProps {
    onSuccess: () => void;
    onMfaRequired: () => void;
    requestId?: string;
}

export default function LoginForm({onSuccess, onMfaRequired, requestId}: LoginFormProps) {
    const {dashboardAuthApiIsLocal} = useContext(ApiContext);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const url: string = dashboardAuthApiIsLocal ? getDashboardAuthLocalUrl() : getDashboardAuthRenderUrl();

    const t = useDebugTranslations("auth.loginForm");

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("username") as string;
        const password = formData.get("password") as string;

        try {
            const result = await loginAction(email, password, url, requestId);

            if (result.status === "error") {
                setError(result.message);
                setIsLoading(false);
                return;
            }

            if (result.status === "mfa_required") {
                setIsLoading(false);
                onMfaRequired();
                return;
            }

            const signInResult = await signIn("mfa", {
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
                expiresIn: result.expiresIn.toString(),
                userInfoJson: result.userInfoJson,
                url: result.url,
                redirect: false,
            });

            if (signInResult?.error) {
                setError(t("invalidCredentials"));
                setIsLoading(false);
                return;
            }

            onSuccess();
        } catch {
            setError(t("genericError"));
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
                <CardTitle className="text-xl">{t("title")}</CardTitle>

                <div className="space-y-2">
                    <Label htmlFor="login-email">{t("email.label")}</Label>
                    <div className="relative">
                        <Input
                            id="login-email"
                            type="email"
                            name="username"
                            placeholder={t("email.placeholder")}
                            className="pl-10"
                            required
                        />
                        <AtSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="login-password">{t("password.label")}</Label>
                    <div className="relative">
                        <Input
                            id="login-password"
                            type="password"
                            name="password"
                            placeholder={t("password.placeholder")}
                            className="pl-10"
                            required
                            minLength={6}
                        />
                        <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
                    </div>
                </div>

                <Button className="w-full" type="submit" disabled={isLoading}>
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin"/>
                    ) : (
                        <>
                            {t("login")}
                            <ArrowRightIcon className="ml-2 h-4 w-4"/>
                        </>
                    )}
                </Button>

                {error && (
                    <div className="flex items-center gap-2 text-destructive text-sm">
                        <ShieldAlert className="h-4 w-4"/>
                        <span>{error}</span>
                    </div>
                )}
            </form>
        </div>
    );
}
