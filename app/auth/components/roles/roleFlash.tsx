"use client"

import {Card} from "@hugovrana/dashboard-frontend-shared/components";
import {clsx} from "clsx";
import {CardContent} from "@hugovrana/dashboard-frontend-shared";
import {CheckCircle2, ShieldAlert} from "lucide-react";
import {FlashState} from "@/app/auth/models/components/flashState";

export function RolesFlash(flash : FlashState) {
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