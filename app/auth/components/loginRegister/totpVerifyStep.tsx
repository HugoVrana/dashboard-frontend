"use client"

import {ArrowRightIcon, Loader2, ShieldAlert} from "lucide-react";
import {FormEvent, useState} from "react";
import {signIn} from "next-auth/react";
import {useDebugTranslations} from "@/app/shared/contexts/translations/useDebugTranslations";
import {Button, CardTitle, Input, Label} from "@hugovrana/dashboard-frontend-shared";
import {completeMfaLoginAction} from "@/app/auth/actions/loginActions";
import {TotpCodeSchema} from "@/app/auth/models/authMessaging/totpCode";
import {TotpVerifyStepProps} from "@/app/auth/models/components/totpVerifyStepProps";

export default function TotpVerifyStep({onComplete, onBack}: TotpVerifyStepProps) {
    const [code, setCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const t = useDebugTranslations("auth.totpVerify");

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const validatedFields = TotpCodeSchema.safeParse({code});

        if (!validatedFields.success) {
            setError(validatedFields.error.issues[0]?.message ?? t("signInError"));
            return;
        }

        setError(null);
        setIsLoading(true);

        const result = await completeMfaLoginAction(validatedFields.data.code);

        if (result.status === "error") {
            setError(result.message);
            setIsLoading(false);
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
            setError(t("signInError"));
            setIsLoading(false);
            return;
        }

        onComplete();
    };

    return (
        <div className="space-y-4">
            <CardTitle className="text-xl">{t("title")}</CardTitle>
            <p className="text-sm text-muted-foreground">{t("description")}</p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="totp-verify-code">{t("codeLabel")}</Label>
                    <Input
                        id="totp-verify-code"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        placeholder={t("codePlaceholder")}
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                        className="text-center text-lg tracking-widest font-mono"
                        autoFocus
                    />
                </div>

                <Button className="w-full" type="submit" disabled={isLoading || code.length !== 6}>
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin"/>
                    ) : (
                        <>
                            {t("verifyButton")}
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

            <Button variant="outline" className="w-full" onClick={onBack} disabled={isLoading}>
                {t("backButton")}
            </Button>
        </div>
    );
}
