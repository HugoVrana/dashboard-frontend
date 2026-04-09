"use client"

import {Button, Card, CardContent} from "@hugovrana/dashboard-frontend-shared";
import {ShieldAlert} from "lucide-react";
import {useDebugTranslations} from "@/app/shared/contexts/translations/useDebugTranslations";
import {LoadErrorProps} from "@/app/auth/models/components/loadErrorProps";

export function RolesLoadError(props: LoadErrorProps) {
    const t = useDebugTranslations("auth.roles");
    if (!props.loadError) return null;

    return (
        <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="flex items-center justify-between gap-3 py-4">
                <div className="flex items-center gap-3">
                    <ShieldAlert className="size-4 text-destructive" />
                    <p className="text-sm">{props.loadError}</p>
                </div>
                <Button variant="outline" onClick={props.onRetry} disabled={props.loading}>
                    {t("retry")}
                </Button>
            </CardContent>
        </Card>
    );
}
