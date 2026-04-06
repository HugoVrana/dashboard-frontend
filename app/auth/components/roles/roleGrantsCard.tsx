"use client"

import {Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Tabs, TabsContent, TabsList, TabsTrigger} from "@hugovrana/dashboard-frontend-shared";
import {KeyRound, Search} from "lucide-react";
import type {GrantRead} from "@/app/auth/models/grant/grantRead";
import type {RoleRead} from "@/app/auth/models/role/roleRead";
import type {GrantDrafts} from "@/app/auth/components/roles/types";
import {useDebugTranslations} from "@/app/shared/contexts/translations/useDebugTranslations";

type Props = {
    selectedRole: RoleRead | null;
    assignedGrantIds: Set<string>;
    assignedGrants: GrantRead[];
    visibleGrants: GrantRead[];
    grantDrafts: GrantDrafts;
    grantSearch: string;
    busyKey: string | null;
    onGrantSearchChange: (value: string) => void;
    onGrantDraftChange: (grantId: string, patch: {name?: string; description?: string}) => void;
    onGrantMutation: (grantId: string, assigned: boolean) => Promise<void>;
    onUpdateGrant: (grantId: string) => Promise<void>;
    onDeleteGrant: (grantId: string) => Promise<void>;
};

export default function RoleGrantsCard({
    selectedRole,
    assignedGrantIds,
    assignedGrants,
    visibleGrants,
    grantDrafts,
    grantSearch,
    busyKey,
    onGrantSearchChange,
    onGrantDraftChange,
    onGrantMutation,
    onUpdateGrant,
    onDeleteGrant,
}: Props) {
    const t = useDebugTranslations("dashboard.roles");
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
                            value={grantSearch}
                            onChange={(event) => onGrantSearchChange(event.target.value)}
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
                        {selectedRole ? (
                            assignedGrants.length > 0 ? (
                                assignedGrants
                                    .filter((grant) => visibleGrants.some((visibleGrant) => visibleGrant.id === grant.id))
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
                                            <form action={async () => onGrantMutation(grant.id, true)}>
                                                <Button
                                                    type="submit"
                                                    variant="outline"
                                                    disabled={busyKey === `remove-${grant.id}`}
                                                >
                                                    {busyKey === `remove-${grant.id}` ? t("grants.removing") : t("grants.remove")}
                                                </Button>
                                            </form>
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
                        {visibleGrants.length > 0 ? (
                            visibleGrants.map((grant) => {
                                const assigned = assignedGrantIds.has(grant.id);
                                const draft = grantDrafts[grant.id] ?? {
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
                                            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
                                                <Input
                                                    value={draft.name}
                                                    onChange={(event) => onGrantDraftChange(grant.id, {name: event.target.value})}
                                                    placeholder={t("createGrant.namePlaceholder")}
                                                />
                                                <Input
                                                    value={draft.description}
                                                    onChange={(event) => onGrantDraftChange(grant.id, {description: event.target.value})}
                                                    placeholder={t("createGrant.descriptionPlaceholder")}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <form action={async () => onUpdateGrant(grant.id)}>
                                                <Button
                                                    type="submit"
                                                    variant="outline"
                                                    disabled={busyKey === `update-grant-${grant.id}`}
                                                >
                                                    {busyKey === `update-grant-${grant.id}` ? t("grants.saving") : t("grants.save")}
                                                </Button>
                                            </form>
                                            <form action={async () => onDeleteGrant(grant.id)}>
                                                <Button
                                                    type="submit"
                                                    variant="destructive"
                                                    disabled={busyKey === `delete-grant-${grant.id}`}
                                                >
                                                    {busyKey === `delete-grant-${grant.id}` ? t("grants.deleting") : t("grants.delete")}
                                                </Button>
                                            </form>
                                            {selectedRole ? (
                                                <form action={async () => onGrantMutation(grant.id, assigned)}>
                                                    <Button
                                                        type="submit"
                                                        variant={assigned ? "outline" : "default"}
                                                        disabled={busyKey === `${assigned ? "remove" : "add"}-${grant.id}`}
                                                    >
                                                        {busyKey === `${assigned ? "remove" : "add"}-${grant.id}`
                                                            ? assigned ? t("grants.removing") : t("grants.adding")
                                                            : assigned ? t("grants.remove") : t("grants.add")}
                                                    </Button>
                                                </form>
                                            ) : (
                                                <Button type="button" variant="outline" disabled>
                                                    {t("grants.selectRole")}
                                                </Button>
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
