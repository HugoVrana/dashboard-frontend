"use client"

import {Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label} from "@hugovrana/dashboard-frontend-shared";
import {PencilLine, RefreshCcw, Trash2, Users} from "lucide-react";
import {useDebugTranslations} from "@/app/shared/contexts/translations/useDebugTranslations";
import {RoleDetailCardProps} from "@/app/auth/models/components/roleDetailCardProps";

export default function RoleDetailCard(props : RoleDetailCardProps) {
    const t = useDebugTranslations("auth.roles");
    return (
        <Card className="border-slate-200/80 dark:border-slate-800">
            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <CardTitle>{props.selectedRole?.name ?? t("detail.emptyTitle")}</CardTitle>
                        {props.selectedRole && <Badge variant="outline">{props.assignedGrantCount}</Badge>}
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" onClick={props.onRefresh} disabled={props.loading || !!props.busyKey}>
                        <RefreshCcw className="mr-2 size-4" />
                        {t("refresh")}
                    </Button>
                    {props.selectedRole && props.canDelete && (
                        <form action={props.onDeleteRole}>
                            <Button type="submit" variant="destructive" disabled={props.busyKey === "delete"}>
                                <Trash2 className="mr-2 size-4" />
                                {props.busyKey === "delete" ? t("detail.deleting") : t("detail.delete")}
                            </Button>
                        </form>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {props.selectedRole ? (
                    <div className={`grid gap-6 ${props.canEdit ? "lg:grid-cols-[minmax(0,1fr)_220px]" : ""}`}>
                        {props.canEdit && (
                            <form action={props.onUpdateRole} className="space-y-4 rounded-2xl border bg-muted/20 p-4">
                                <div className="space-y-2">
                                    <Label htmlFor="role-edit-name">{t("fields.name")}</Label>
                                    <Input
                                        id="role-edit-name"
                                        name="name"
                                        value={props.editName}
                                        onChange={(event) => props.onEditNameChange(event.target.value)}
                                        required
                                    />
                                </div>
                                <Button type="submit" disabled={props.busyKey === "update"}>
                                    <PencilLine className="mr-2 size-4" />
                                    {props.busyKey === "update" ? t("detail.saving") : t("detail.save")}
                                </Button>
                            </form>
                        )}

                        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                            <div className="rounded-2xl border bg-background p-4">
                                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{t("detail.stats.grants")}</p>
                                <p className="mt-2 text-2xl font-semibold">{props.assignedGrantCount}</p>
                            </div>
                            <div className="rounded-2xl border bg-background p-4">
                                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{t("detail.stats.id")}</p>
                                <p className="mt-2 truncate text-sm font-medium text-muted-foreground">{props.selectedRole.id}</p>
                            </div>
                            <div className="rounded-2xl border bg-background p-4">
                                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{t("detail.stats.type")}</p>
                                <p className="mt-2 text-sm font-medium">{t("detail.stats.custom")}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-3xl border border-dashed p-10 text-center">
                        <Users className="mx-auto size-10 text-muted-foreground" />
                        <p className="mt-4 text-base font-medium">{t("detail.emptyTitle")}</p>
                        <p className="mt-2 text-sm text-muted-foreground">{t("detail.emptyDescription")}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
