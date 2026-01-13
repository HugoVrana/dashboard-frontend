"use client"

import {CardTitle} from "@/app/ui/base/card";
import {Label} from "@/app/ui/base/label";
import {Input} from "@/app/ui/base/input";
import {ArrowRightIcon, AtSign, KeyIcon, ShieldAlert} from "lucide-react";
import {Button} from "@/app/ui/base/button";
import {useActionState, useContext} from "react";
import {ApiContext} from "@/app/lib/devOverlay/apiContext";
import {useSearchParams} from "next/navigation";
import {getDashboardAuthLocalUrl, getDashboardAuthRenderUrl} from "@/app/lib/devOverlay/dashboardAuthApiContext";
import {register} from "@/app/lib/actions";
import {useTranslations} from "next-intl";

export default function RegisterForm() {
    const searchParams = useSearchParams();
    const { dashboardAuthApiIsLocal } = useContext(ApiContext);

    const url : string = dashboardAuthApiIsLocal ? getDashboardAuthLocalUrl() : getDashboardAuthRenderUrl();
    const callbackUrl : string = searchParams.get('callbackUrl') || '/dashboard';

    const registerAction = register.bind("url", url);
    const [registerError, registerFormAction, registerPending] = useActionState(registerAction, undefined);

    const t = useTranslations("auth.registerForm");

    return (
        <form action={registerFormAction} className="space-y-4">
            <CardTitle className="text-xl">{t('title')}</CardTitle>

            <div className="space-y-2">
                <Label htmlFor="register-email">{t('email.label')}</Label>
                <div className="relative">
                    <Input
                        id="register-email"
                        type="email"
                        name="email"
                        placeholder={t('email.placeholder')}
                        className="pl-10"
                        required
                    />
                    <AtSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="register-password">{t('password.label')}</Label>
                <div className="relative">
                    <Input
                        id="register-password"
                        type="password"
                        name="password"
                        placeholder={t('password.placeholder')}
                        className="pl-10"
                        required
                        minLength={6}
                    />
                    <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="confirm-password">{t('confirmPassword.label')}</Label>
                <div className="relative">
                    <Input
                        id="confirm-password"
                        type="password"
                        name="confirmPassword"
                        placeholder={t('confirmPassword.placeholder')}
                        className="pl-10"
                        required
                        minLength={6}
                    />
                    <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
            </div>

            <Input className="hidden" name="redirectTo" value={callbackUrl} />

            <Button className="w-full" type={"submit"} disabled={registerPending}>
                {t('signUp')}
                <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Button>

            {registerError && (
                <div className="flex items-center gap-2 text-destructive text-sm">
                    <ShieldAlert className="h-4 w-4" />
                    <span>{registerError.message}</span>
                </div>
            )}
        </form>
    );
}