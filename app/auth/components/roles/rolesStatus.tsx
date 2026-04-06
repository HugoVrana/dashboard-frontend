"use client"

import {Button, Card, CardContent} from "@hugovrana/dashboard-frontend-shared";
import {CheckCircle2, ShieldAlert} from "lucide-react";
import {clsx} from "clsx";
import type {FlashState} from "@/app/auth/components/roles/types";
import {useDebugTranslations} from "@/app/shared/contexts/translations/useDebugTranslations";

export function RolesFlash({flash}: {flash: FlashState}) {
    if (!flash) return null;

    return (
        <Card className={clsx(
            "border",
            flash.tone === "success"
                ? "border-emerald-400/60 bg-emerald-50 dark:bg-emerald-950/20"
                : "border-destructive/50 bg-destructive/10"
        )}>
            <CardContent className="flex items-center gap-3 py-3">
                {flash.tone === "success" ? (
                    <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                    <ShieldAlert className="size-4 text-destructive" />
                )}
                <p className="text-sm">{flash.message}</p>
            </CardContent>
        </Card>
    );
}

type LoadErrorProps = {
    loadError: string | null;
    loading: boolean;
    onRetry: () => void;
};

export function RolesLoadError({loadError, loading, onRetry}: LoadErrorProps) {
    const t = useDebugTranslations("dashboard.roles");
    if (!loadError) return null;

    return (
        <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="flex items-center justify-between gap-3 py-4">
                <div className="flex items-center gap-3">
                    <ShieldAlert className="size-4 text-destructive" />
                    <p className="text-sm">{loadError}</p>
                </div>
                <Button variant="outline" onClick={onRetry} disabled={loading}>
                    {t("retry")}
                </Button>
            </CardContent>
        </Card>
    );
}
