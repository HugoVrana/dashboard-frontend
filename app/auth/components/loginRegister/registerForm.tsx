"use client"

import {ArrowRightIcon, AtSign, KeyIcon, Loader2, ShieldAlert} from "lucide-react";
import {FormEvent, useContext, useState} from "react";
import {ApiContext} from "@/app/shared/components/devOverlay/apiContext";
import {getDashboardAuthLocalUrl, getDashboardAuthRenderUrl} from "@/app/auth/dashboardAuthApiContext";
import {useDebugTranslations} from "@/app/shared/contexts/translations/useDebugTranslations";
import {AvatarUpload, Button, CardTitle, Input, Label} from "@hugovrana/dashboard-frontend-shared";
import {establishSessionAfterRegister, registerUser, setProfilePicture} from "@/app/auth/actions/userActions";
import {loginAction} from "@/app/auth/actions/loginActions";
import {RegisterFormSchema} from "@/app/auth/models/authMessaging/registerRequest";
import {RegisterFormProps} from "@/app/auth/models/components/registerFormProps";

export default function RegisterForm({onComplete, onMfaRequired, onTwoFactorEnrollmentRequired}: RegisterFormProps) {
    const { dashboardAuthApiIsLocal } = useContext(ApiContext);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [image, setImage] = useState<File | null>(null);

    const url: string = dashboardAuthApiIsLocal ? getDashboardAuthLocalUrl() : getDashboardAuthRenderUrl();

    const t = useDebugTranslations("auth.registerForm");

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const validatedFields = RegisterFormSchema.safeParse({
            email: formData.get('email'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword'),
        });

        if (!validatedFields.success) {
            setError(validatedFields.error.issues[0]?.message ?? 'Invalid form data. Please check your inputs.');
            setIsLoading(false);
            return;
        }

        const {email, password} = validatedFields.data;

        try {
            const result = await registerUser(url, { message: null }, formData);
            console.log("[register] registerUser result", result);

            if (!result.success) {
                setError(result.message);
                setIsLoading(false);
                return;
            }

            const loginResult = await loginAction(email, password, url);
            console.log("[register] loginAction result", loginResult);

            if (loginResult.status === 'error') {
                setError(`Registration succeeded, but login failed: ${loginResult.message}`);
                setIsLoading(false);
                return;
            }

            if (loginResult.status === 'mfa_required') {
                setIsLoading(false);
                onMfaRequired();
                return;
            }

            const signInResult = await establishSessionAfterRegister({
                accessToken: loginResult.accessToken,
                refreshToken: loginResult.refreshToken,
                expiresIn: loginResult.expiresIn,
                userInfoJson: loginResult.userInfoJson,
                url: loginResult.url,
            });
            console.log("[register] signIn result", signInResult);

            if (!signInResult.success) {
                setError(`Registration succeeded, but session sign-in failed: ${signInResult.message}`);
                setIsLoading(false);
                return;
            }

            // Upload profile picture if selected
            if (image) {
                const imageFormData = new FormData();
                imageFormData.append('file', image);
                const uploadResult = await setProfilePicture(imageFormData);
                if (!uploadResult.success) {
                    console.warn('Profile picture upload failed:', uploadResult.message);
                }
            }

            setIsLoading(false);
            if (result.nextStep === "ENROLL_2FA") {
                onTwoFactorEnrollmentRequired({ accessToken: loginResult.accessToken, url: loginResult.url });
                return;
            }

            onComplete();
        } catch (error) {
            console.error("[register] unexpected error", error);
            setError(error instanceof Error ? error.message : 'Something went wrong.');
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
                        minLength={8}
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
                        minLength={8}
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
