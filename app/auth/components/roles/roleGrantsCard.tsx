"use client"

import {Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Tabs, TabsContent, TabsList, TabsTrigger} from "@hugovrana/dashboard-frontend-shared";
import {KeyRound, Search} from "lucide-react";
import {useDebugTranslations} from "@/app/shared/contexts/translations/useDebugTranslations";
import {RoleGrantsCardProps} from "@/app/auth/models/components/roleGrantsCardProps";

export default function RoleGrantsCard(props : RoleGrantsCardProps) {
    const t = useDebugTranslations("auth.roles");
    return (
        <Card className="border-slate-200/80 dark:border-slate-800">
            <CardHeader className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <CardTitle>{t("grants.title")}</CardTitle>
                        <CardDescription>{t("grants.description")}</CardDescription>
                    </div>
                    <div className="relative w-full max-w-64">
                        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={props.grantSearch}
                            onChange={(event) => props.onGrantSearchChange(event.target.value)}
                            placeholder={t("grants.search")}
                            className="pl-9"
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="assigned" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="assigned">{t("grants.tabs.assigned")}</TabsTrigger>
                        <TabsTrigger value="catalog">{t("grants.tabs.catalog")}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="assigned" className="mt-4 space-y-3">
                        {props.selectedRole ? (
                            props.assignedGrants.length > 0 ? (
                                props.assignedGrants
                                    .filter((grant) => props.visibleGrants.some((visibleGrant) => visibleGrant.id === grant.id))
                                    .map((grant) => (
                                        <div key={grant.id} className="flex flex-col gap-3 rounded-2xl border p-4 md:flex-row md:items-center md:justify-between">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <KeyRound className="size-4 text-amber-600" />
                                                    <p className="font-medium">{grant.name}</p>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {grant.description ?? t("grants.noDescription")}
                                                </p>
                                            </div>
                                            {props.canManageRoleGrants && (
                                                <form action={async () => props.onGrantMutation(grant.id, true)}>
                                                    <Button
                                                        type="submit"
                                                        variant="outline"
                                                        disabled={props.busyKey === `remove-${grant.id}`}
                                                    >
                                                        {props.busyKey === `remove-${grant.id}` ? t("grants.removing") : t("grants.remove")}
                                                    </Button>
                                                </form>
                                            )}
                                        </div>
                                    ))
                            ) : (
                                <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                                    {t("grants.emptyAssigned")}
                                </div>
                            )
                        ) : (
                            <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                                {t("detail.emptyDescription")}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="catalog" className="mt-4 space-y-3">
                        {props.visibleGrants.length > 0 ? (
                            props.visibleGrants.map((grant) => {
                                const assigned : boolean = props.assignedGrantIds.has(grant.id);
                                const draft = props.grantDrafts[grant.id] ?? {
                                    name: grant.name,
                                    description: grant.description ?? "",
                                };

                                return (
                                    <div key={grant.id} className="flex flex-col gap-3 rounded-2xl border p-4 md:flex-row md:items-center md:justify-between">
                                        <div className="min-w-0 flex-1 space-y-3">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="font-medium">{grant.name}</p>
                                                <Badge variant={assigned ? "default" : "outline"}>
                                                    {assigned ? t("grants.assigned") : t("grants.available")}
                                                </Badge>
                                            </div>
                                            {props.canUpdateGrant && (
                                                <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
                                                    <Input
                                                        value={draft.name}
                                                        onChange={(event) => props.onGrantDraftChange(grant.id, {name: event.target.value})}
                                                        placeholder={t("createGrant.namePlaceholder")}
                                                    />
                                                    <Input
                                                        value={draft.description}
                                                        onChange={(event) => props.onGrantDraftChange(grant.id, {description: event.target.value})}
                                                        placeholder={t("createGrant.descriptionPlaceholder")}
                                                    />
                                                </div>
                                            )}
                                            {!props.canUpdateGrant && grant.description && (
                                                <p className="text-sm text-muted-foreground">{grant.description}</p>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            {props.canUpdateGrant && (
                                                <form action={async () => props.onUpdateGrant(grant.id)}>
                                                    <Button
                                                        type="submit"
                                                        variant="outline"
                                                        disabled={props.busyKey === `update-grant-${grant.id}`}
                                                    >
                                                        {props.busyKey === `update-grant-${grant.id}` ? t("grants.saving") : t("grants.save")}
                                                    </Button>
                                                </form>
                                            )}
                                            {props.canDeleteGrant && (
                                                <form action={async () => props.onDeleteGrant(grant.id)}>
                                                    <Button
                                                        type="submit"
                                                        variant="destructive"
                                                        disabled={props.busyKey === `delete-grant-${grant.id}`}
                                                    >
                                                        {props.busyKey === `delete-grant-${grant.id}` ? t("grants.deleting") : t("grants.delete")}
                                                    </Button>
                                                </form>
                                            )}
                                            {props.canManageRoleGrants && (
                                                props.selectedRole ? (
                                                    <form action={async () => props.onGrantMutation(grant.id, assigned)}>
                                                        <Button
                                                            type="submit"
                                                            variant={assigned ? "outline" : "default"}
                                                            disabled={props.busyKey === `${assigned ? "remove" : "add"}-${grant.id}`}
                                                        >
                                                            {props.busyKey === `${assigned ? "remove" : "add"}-${grant.id}`
                                                                ? assigned ? t("grants.removing") : t("grants.adding")
                                                                : assigned ? t("grants.remove") : t("grants.add")}
                                                        </Button>
                                                    </form>
                                                ) : (
                                                    <Button type="button" variant="outline" disabled>
                                                        {t("grants.selectRole")}
                                                    </Button>
                                                )
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                                {t("grants.noMatch")}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
