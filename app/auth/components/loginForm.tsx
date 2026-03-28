"use client";

import {ArrowRightIcon, AtSign, KeyIcon, Loader2, ShieldAlert} from "lucide-react";
import {signIn} from "next-auth/react";
import {FormEvent, useContext, useState} from "react";
import {ApiContext} from "@/app/shared/components/devOverlay/apiContext";
import {getDashboardAuthLocalUrl, getDashboardAuthRenderUrl} from "@/app/auth/dashboardAuthApiContext";
import {useSearchParams} from "next/navigation";
import {useDebugTranslations} from "@/app/shared/contexts/translations/useDebugTranslations";
import {Button, CardTitle, Input, Label } from "@hugovrana/dashboard-frontend-shared";

export default function LoginForm() {
    const searchParams = useSearchParams();
    const { dashboardAuthApiIsLocal } = useContext(ApiContext);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const url: string = dashboardAuthApiIsLocal ? getDashboardAuthLocalUrl() : getDashboardAuthRenderUrl();
    const callbackUrl: string = searchParams.get('callbackUrl') || '/dashboard';

    // OAuth2 browser redirect flow: backend redirected here with a request_id
    const requestId: string | null = searchParams.get('request_id');
    const isOAuth2Redirect = !!requestId;

    const t = useDebugTranslations("auth.loginForm");

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        // OAuth2 browser flow: let the form POST natively to the backend.
        // The backend will validate credentials and redirect to the callback URI with the auth code.
        if (isOAuth2Redirect) {
            setIsLoading(true);
            return; // allow native form submission
        }

        // Server-side flow: use NextAuth Credentials provider
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const email = formData.get('username') as string;
        const password = formData.get('password') as string;

        try {
            const result = await signIn('credentials', {
                email,
                password,
                url,
                redirect: false,
            });

            if (result?.error) {
                setError('Invalid credentials.');
                setIsLoading(false);
            } else {
                window.location.href = callbackUrl;
            }
        } catch {
            setError('Something went wrong.');
            setIsLoading(false);
        }
    };

    // Initiate the browser-based OAuth2 redirect flow
    const handleOAuth2Login = () => {
        setIsLoading(true);
        signIn("dashboard-oauth", { callbackUrl });
    };

    return (
        <div className="space-y-4">
            {/* OAuth2 browser redirect flow button */}
            {!isOAuth2Redirect && (
                <>
                    <Button
                        className="w-full"
                        variant="outline"
                        onClick={handleOAuth2Login}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                {t("login")}
                                <ArrowRightIcon className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">or</span>
                        </div>
                    </div>
                </>
            )}

            {/* Credential form — native POST for OAuth2 redirect, JS submit for Credentials provider */}
            <form
                onSubmit={handleSubmit}
                action={isOAuth2Redirect ? `${url}/v2/oauth2/authorize` : undefined}
                method={isOAuth2Redirect ? "POST" : undefined}
                className="space-y-4"
            >
                <CardTitle className="text-xl">{t("title")}</CardTitle>

                {/* Hidden request_id for the OAuth2 browser flow */}
                {isOAuth2Redirect && (
                    <input type="hidden" name="request_id" value={requestId!} />
                )}

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
                        <AtSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                        <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                </div>

                <Button className="w-full" type="submit" disabled={isLoading}>
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <>
                            {t("login")}
                            <ArrowRightIcon className="ml-2 h-4 w-4" />
                        </>
                    )}
                </Button>

                {error && (
                    <div className="flex items-center gap-2 text-destructive text-sm">
                        <ShieldAlert className="h-4 w-4" />
                        <span>{error}</span>
                    </div>
                )}
            </form>
        </div>
    );
}
