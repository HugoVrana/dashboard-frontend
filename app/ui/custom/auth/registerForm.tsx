"use client"

import {CardTitle} from "@/app/ui/base/card";
import {Label} from "@/app/ui/base/label";
import {Input} from "@/app/ui/base/input";
import {ArrowRightIcon, AtSign, KeyIcon, Loader2, ShieldAlert} from "lucide-react";
import {Button} from "@/app/ui/base/button";
import {FormEvent, useContext, useState} from "react";
import {ApiContext} from "@/app/lib/devOverlay/apiContext";
import {useSearchParams} from "next/navigation";
import {getDashboardAuthLocalUrl, getDashboardAuthRenderUrl} from "@/app/lib/devOverlay/dashboardAuthApiContext";
import {registerUser, setProfilePicture} from "@/app/lib/actions";
import {getSession, signIn} from "next-auth/react";
import {useDebugTranslations} from "@/app/lib/i18n/useDebugTranslations";
import {AvatarUpload} from "@/app/ui/base/avatar-upload";

export default function RegisterForm() {
    const searchParams = useSearchParams();
    const { dashboardAuthApiIsLocal } = useContext(ApiContext);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [image, setImage] = useState<File | null>(null)

    const url: string = dashboardAuthApiIsLocal ? getDashboardAuthLocalUrl() : getDashboardAuthRenderUrl();
    const callbackUrl: string = searchParams.get('callbackUrl') || '/dashboard';

    const t = useDebugTranslations("auth.registerForm");

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const confirmPassword = formData.get('confirmPassword') as string;

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            setIsLoading(false);
            return;
        }

        try {
            const result = await registerUser(url, { message: null }, formData);

            if (!result.success) {
                setError(result.message);
                setIsLoading(false);
                return;
            }

            const signInResult = await signIn('credentials', {
                email,
                password,
                url,
                redirect: false,
            });

            if (signInResult?.error) {
                setError('Registration successful but login failed. Please try logging in.');
                setIsLoading(false);
                return;
            }

            // Upload profile picture if selected
            if (image) {
                // Force session refresh to ensure cookies are propagated
                const session = await getSession();
                if (session) {
                    const imageFormData = new FormData();
                    imageFormData.append('file', image);
                    const uploadResult = await setProfilePicture(imageFormData);
                    if (!uploadResult.success) {
                        console.warn('Profile picture upload failed:', uploadResult.message);
                    }
                } else {
                    console.warn('Session not available for profile picture upload');
                }
            }

            window.location.href = callbackUrl;
        } catch {
            setError('Something went wrong.');
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
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

            <div className="flex justify-center">
                <AvatarUpload
                    value={image}
                    onImageSelect={setImage}
                    size="xl"
                    maxSizeBytes={1024 * 1024} // 1MB - Next.js server action limit
                    labels={{
                        upload: t("avatarUpload.upload"),
                        change: t("avatarUpload.change"),
                        remove: t("avatarUpload.delete"),
                        fileTooLarge: t("avatarUpload.fileTooLarge"),
                        invalidFileType: t("avatarUpload.invalidFileType"),
                    }}
                />
            </div>

            <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <>
                        {t('signUp')}
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