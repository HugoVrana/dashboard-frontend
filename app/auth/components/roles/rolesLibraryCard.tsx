"use client"

import {Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, Input} from "@hugovrana/dashboard-frontend-shared";
import {Search} from "lucide-react";
import {clsx} from "clsx";
import {useDebugTranslations} from "@/app/shared/contexts/translations/useDebugTranslations";
import {RolesLibraryCardProps} from "@/app/auth/models/components/rolesLibraryCardProps";

export default function RolesLibraryCard(props : RolesLibraryCardProps) {
    const t = useDebugTranslations("auth.roles");
    return (
        <Card className="border-slate-200/80 dark:border-slate-800">
            <CardHeader className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <CardTitle>{t("library.title")}</CardTitle>
                        <CardDescription>{t("library.description")}</CardDescription>
                    </div>
                    <Badge variant="outline">{props.roles.length}</Badge>
                </div>
                <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={props.roleSearch}
                        onChange={(event) => props.onRoleSearchChange(event.target.value)}
                        placeholder={t("library.search")}
                        className="pl-9"
                    />
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {props.loading ? (
                    <div className="space-y-2">
                        <div className="h-16 animate-pulse rounded-2xl bg-muted" />
                        <div className="h-16 animate-pulse rounded-2xl bg-muted" />
                        <div className="h-16 animate-pulse rounded-2xl bg-muted" />
                    </div>
                ) : props.filteredRoles.length > 0 ? (
                    props.filteredRoles.map((role) => (
                        <button
                            key={role.id}
                            type="button"
                            onClick={() => props.onRoleSelect(role.id)}
                            className={clsx(
                                "w-full rounded-2xl border p-4 text-left transition",
                                role.id === props.selectedRoleId
                                    ? "border-amber-300 bg-amber-50 shadow-sm dark:border-amber-600/50 dark:bg-amber-950/20"
                                    : "border-border/60 bg-background hover:border-amber-200 hover:bg-amber-50/60 dark:hover:border-amber-700/40 dark:hover:bg-amber-950/10"
                            )}
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="truncate font-medium">{role.name}</p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {t("library.grantCount", {count: role.grants.length})}
                                    </p>
                                </div>
                                <Badge variant={role.id === props.selectedRoleId ? "default" : "outline"}>
                                    {role.grants.length}
                                </Badge>
                            </div>
                        </button>
                    ))
                ) : (
                    <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                        {props.roles.length === 0 ? t("library.empty") : t("library.noMatch")}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
