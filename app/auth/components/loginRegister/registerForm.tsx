"use client"

import {ArrowRightIcon, AtSign, KeyIcon, Loader2, ShieldAlert} from "lucide-react";
import {FormEvent, useContext, useState} from "react";
import {ApiContext} from "@/app/shared/components/devOverlay/apiContext";
import {getDashboardAuthLocalUrl, getDashboardAuthRenderUrl} from "@/app/auth/dashboardAuthApiContext";
import {getSession, signIn} from "next-auth/react";
import {useDebugTranslations} from "@/app/shared/contexts/translations/useDebugTranslations";
import {AvatarUpload, Button, CardTitle, Input, Label} from "@hugovrana/dashboard-frontend-shared";
import {registerUser, setProfilePicture} from "@/app/auth/actions/userActions";
import {loginAction} from "@/app/auth/actions/loginActions";
import {RegisterFormSchema} from "@/app/auth/models/authMessaging/registerRequest";
import {RegisterFormProps} from "@/app/auth/models/components/registerFormProps";

export default function RegisterForm({onComplete}: RegisterFormProps) {
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

            if (!result.success) {
                setError(result.message);
                setIsLoading(false);
                return;
            }

            const loginResult = await loginAction(email, password, url);

            if (loginResult.status === 'error') {
                setError('Registration successful but login failed. Please try logging in.');
                setIsLoading(false);
                return;
            }

            if (loginResult.status === 'mfa_required') {
                setIsLoading(false);
                onComplete();
                return;
            }

            const signInResult = await signIn('mfa', {
                accessToken: loginResult.accessToken,
                refreshToken: loginResult.refreshToken,
                expiresIn: loginResult.expiresIn.toString(),
                userInfoJson: loginResult.userInfoJson,
                url: loginResult.url,
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

            setIsLoading(false);
            onComplete();
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
