"use client";

import {CardTitle} from "@/app/ui/base/card";
import {Label} from "@/app/ui/base/label";
import {Input} from "@/app/ui/base/input";
import {ArrowRightIcon, AtSign, KeyIcon, Loader2, ShieldAlert} from "lucide-react";
import {Button} from "@/app/ui/base/button";
import {signIn} from "next-auth/react";
import {FormEvent, useContext, useState} from "react";
import {ApiContext} from "@/app/lib/devOverlay/apiContext";
import {getDashboardAuthLocalUrl, getDashboardAuthRenderUrl} from "@/app/lib/devOverlay/dashboardAuthApiContext";
import {useSearchParams} from "next/navigation";
import {useDebugTranslations} from "@/app/lib/devOverlay/useDebugTranslations";

export default function LoginForm() {
    const searchParams = useSearchParams();
    const { dashboardAuthApiIsLocal } = useContext(ApiContext);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const url: string = dashboardAuthApiIsLocal ? getDashboardAuthLocalUrl() : getDashboardAuthRenderUrl();
    const callbackUrl: string = searchParams.get('callbackUrl') || '/dashboard';

    const t = useDebugTranslations("auth.loginForm");

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;
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

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <CardTitle className="text-xl">{t("title")}</CardTitle>

            <div className="space-y-2">
                <Label htmlFor="login-email">{t("email.label")}</Label>
                <div className="relative">
                    <Input
                        id="login-email"
                        type="email"
                        name="email"
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
    );
}