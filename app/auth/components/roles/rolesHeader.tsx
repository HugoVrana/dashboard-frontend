"use client"

import {Card, CardContent} from "@hugovrana/dashboard-frontend-shared";
import {Shield} from "lucide-react";
import {useDebugTranslations} from "@/app/shared/contexts/translations/useDebugTranslations";

function MetricCard({title, value}: {title: string; value: string}) {
    return (
        <div className="rounded-2xl border border-border/70 bg-background p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{title}</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
        </div>
    );
}

type Props = {
    roleCount: number;
    grantCount: number;
    selectedGrantCount: number;
};

export default function RolesHeader({roleCount, grantCount, selectedGrantCount}: Props) {
    const t = useDebugTranslations("dashboard.roles");
    return (
        <Card className="border-border/70 shadow-none">
            <CardContent className="p-6 lg:p-8">
                <div className="grid gap-8 xl:grid-cols-[minmax(0,1.5fr)_320px] xl:items-start">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="flex size-11 items-center justify-center rounded-2xl border border-border/70 bg-muted/30">
                                <Shield className="size-5 text-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-foreground">{t("eyebrow")}</p>
                                <p className="text-sm text-muted-foreground">{t("liveData")}</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <h1 className="max-w-2xl text-3xl font-semibold tracking-tight">
                                {t("title")}
                            </h1>
                            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                                {t("description")}
                            </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {t("subheading")}
                        </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                        <MetricCard title={t("stats.roles")} value={roleCount.toString()} />
                        <MetricCard title={t("stats.grants")} value={grantCount.toString()} />
                        <MetricCard title={t("stats.selected")} value={selectedGrantCount.toString()} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
