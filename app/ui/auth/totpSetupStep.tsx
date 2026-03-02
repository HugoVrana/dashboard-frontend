"use client"

import {Loader2, ShieldAlert, ShieldCheck, CheckCircle2} from "lucide-react";
import {useEffect, useState} from "react";
import {setupTotpAction, verifyTotpAction} from "@/app/lib/actions";
import {TotpSetupResponse} from "@/app/models/auth/totpSetupResponse";
import {useDebugTranslations} from "@/app/lib/i18n/useDebugTranslations";
import {Button, CardTitle, Input, Label } from "@hugovrana/dashboard-frontend-shared";

interface TotpSetupStepProps {
    onComplete: () => void;
    onSkip: () => void;
}

export default function TotpSetupStep({onComplete, onSkip}: TotpSetupStepProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [verifyError, setVerifyError] = useState<string | null>(null);
    const [totpData, setTotpData] = useState<TotpSetupResponse | null>(null);
    const [code, setCode] = useState("");
    const [verified, setVerified] = useState(false);

    const t = useDebugTranslations("auth.totpSetup");

    useEffect(() => {
        const fetchTotpSetup = async () => {
            setIsLoading(true);
            setError(null);

            const result = await setupTotpAction();

            if (!result.success || !result.data) {
                setError(result.message);
                setIsLoading(false);
                return;
            }

            setTotpData(result.data);
            setIsLoading(false);
        };

        fetchTotpSetup();
    }, []);

    const handleVerify = async () => {
        if (code.length !== 6) {
            setVerifyError(t("codeError"));
            return;
        }

        setIsVerifying(true);
        setVerifyError(null);

        const result = await verifyTotpAction(code);

        if (!result.success) {
            setVerifyError(result.message);
            setIsVerifying(false);
            return;
        }

        setVerified(true);
        setIsVerifying(false);
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <CardTitle className="text-xl">{t("titleLoading")}</CardTitle>
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-4">
                <CardTitle className="text-xl">{t("titleError")}</CardTitle>
                <div className="flex items-center gap-2 text-destructive text-sm">
                    <ShieldAlert className="h-4 w-4"/>
                    <span>{error}</span>
                </div>
                <Button className="w-full" onClick={onSkip}>
                    {t("continueWithout2FA")}
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <CardTitle className="text-xl flex items-center gap-2">
                <ShieldCheck className="h-5 w-5"/>
                {t("title")}
            </CardTitle>

            <p className="text-sm text-muted-foreground">
                {t("description")}
            </p>

            {totpData && (
                <div className="space-y-4">
                    <div className="flex justify-center p-4 rounded-lg bg-white dark:bg-transparent">
                        <img
                            src={totpData.qrCodeDataUri}
                            alt="TOTP QR Code"
                            className="w-48 h-48 rounded dark:invert"
                        />
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                            {t("secretLabel")}
                        </p>
                        <code className="block p-2 bg-muted rounded text-xs break-all text-center font-mono">
                            {totpData.secret}
                        </code>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="totp-code">{t("codeLabel")}</Label>
                        <div className="flex gap-2">
                            <Input
                                id="totp-code"
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={6}
                                placeholder={t("codePlaceholder")}
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                                className="text-center text-lg tracking-widest font-mono"
                                disabled={verified}
                            />
                            <Button
                                onClick={handleVerify}
                                disabled={isVerifying || verified || code.length !== 6}
                            >
                                {isVerifying ? (
                                    <Loader2 className="h-4 w-4 animate-spin"/>
                                ) : verified ? (
                                    <CheckCircle2 className="h-4 w-4"/>
                                ) : (
                                    t("verifyButton")
                                )}
                            </Button>
                        </div>
                        {verifyError && (
                            <p className="text-sm text-destructive">{verifyError}</p>
                        )}
                        {verified && (
                            <p className="text-sm text-green-600 flex items-center gap-1">
                                <CheckCircle2 className="h-4 w-4"/>
                                {t("verifySuccess")}
                            </p>
                        )}
                    </div>
                </div>
            )}

            <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={onSkip}>
                    {t("skipButton")}
                </Button>
                <Button className="flex-1" onClick={onComplete} disabled={!verified}>
                    {t("continueButton")}
                </Button>
            </div>
        </div>
    );
}
