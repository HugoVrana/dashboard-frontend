"use client"

import {useContext, useDeferredValue, useEffect, useState} from "react";
import {clsx} from "clsx";
import {
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Input,
    Label,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@hugovrana/dashboard-frontend-shared";
import {
    CheckCircle2,
    KeyRound,
    PencilLine,
    Plus,
    RefreshCcw,
    Search,
    ShieldAlert,
    Shield,
    Trash2,
    Users,
} from "lucide-react";
import {ApiContext} from "@/app/shared/components/devOverlay/apiContext";
import {usePermissions} from "@/app/auth/permission/permissionsClient";
import {useRolesApi} from "@/app/auth/hooks/useRolesApi";
import {useDebugTranslations} from "@/app/shared/contexts/translations/useDebugTranslations";
import {
    addGrantToRoleAction,
    createRoleAction,
    deleteRoleAction,
    removeGrantFromRoleAction,
    updateRoleAction,
} from "@/app/auth/actions/roleActions";
import {createGrantAction, deleteGrantAction, updateGrantAction} from "@/app/auth/actions/grantActions";
import type {RoleRead} from "@/app/auth/models/role/roleRead";
import type {GrantRead} from "@/app/auth/models/grant/grantRead";

type FlashState = {
    tone: "success" | "error";
    message: string;
} | null;

function sortRoles(roles: RoleRead[]): RoleRead[] {
    return [...roles].sort((a, b) => a.name.localeCompare(b.name));
}

function MetricCard({title, value, accent}: {title: string; value: string; accent: string}) {
    return (
        <div className="rounded-2xl border border-border/70 bg-background p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{title}</p>
            <p className={clsx("mt-2 text-2xl font-semibold", accent)}>{value}</p>
        </div>
    );
}

export default function RolesContent() {
    const t = useDebugTranslations("dashboard.roles");
    const {isReady: apiContextReady} = useContext(ApiContext);
    const {isLoading: permissionsLoading, isAuthenticated} = usePermissions();
    const {getRoles, getGrants} = useRolesApi();

    const [roles, setRoles] = useState<RoleRead[]>([]);
    const [grants, setGrants] = useState<GrantRead[]>([]);
    const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [busyKey, setBusyKey] = useState<string | null>(null);
    const [flash, setFlash] = useState<FlashState>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);
    const [createName, setCreateName] = useState("");
    const [createGrantName, setCreateGrantName] = useState("");
    const [createGrantDescription, setCreateGrantDescription] = useState("");
    const [grantDrafts, setGrantDrafts] = useState<Record<string, {name: string; description: string}>>({});
    const [editName, setEditName] = useState("");
    const [roleSearch, setRoleSearch] = useState("");
    const [grantSearch, setGrantSearch] = useState("");

    const deferredRoleSearch = useDeferredValue(roleSearch);
    const deferredGrantSearch = useDeferredValue(grantSearch);

    const selectedRole = roles.find((role) => role.id === selectedRoleId) ?? null;
    const filteredRoles = roles.filter((role) =>
        role.name.toLowerCase().includes(deferredRoleSearch.trim().toLowerCase())
    );
    const visibleGrants = grants.filter((grant) => {
        const query = deferredGrantSearch.trim().toLowerCase();
        if (!query) return true;
        return grant.name.toLowerCase().includes(query) || (grant.description ?? "").toLowerCase().includes(query);
    });

    useEffect(() => {
        if (!apiContextReady || permissionsLoading || !isAuthenticated) {
            return;
        }

        async function loadData() {
            setLoading(true);
            setLoadError(null);

            try {
                const [rolesData, grantsData] = await Promise.all([getRoles(), getGrants()]);

                if (!rolesData || !grantsData) {
                    setLoadError(t("loadError"));
                    return;
                }

                const sortedRoles = sortRoles(rolesData);
                setRoles(sortedRoles);
                setGrants(grantsData);
                setGrantDrafts(Object.fromEntries(
                    grantsData.map((grant) => [grant.id, {
                        name: grant.name,
                        description: grant.description ?? "",
                    }])
                ));

                setSelectedRoleId((current) => {
                    if (current && sortedRoles.some((role) => role.id === current)) {
                        return current;
                    }
                    return sortedRoles[0]?.id ?? null;
                });
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [apiContextReady, permissionsLoading, isAuthenticated, getRoles, getGrants, reloadKey, t]);

    useEffect(() => {
        setEditName(selectedRole?.name ?? "");
    }, [selectedRoleId, selectedRole?.name]);

    useEffect(() => {
        if (!flash) return;
        const timer = window.setTimeout(() => setFlash(null), 4000);
        return () => window.clearTimeout(timer);
    }, [flash]);

    function replaceRole(updatedRole: RoleRead) {
        setRoles((current) => sortRoles(current.map((role) => role.id === updatedRole.id ? updatedRole : role)));
    }

    function replaceGrant(updatedGrant: GrantRead) {
        setGrants((current) => current
            .map((grant) => grant.id === updatedGrant.id ? updatedGrant : grant)
            .sort((a, b) => a.name.localeCompare(b.name))
        );
        setGrantDrafts((current) => ({
            ...current,
            [updatedGrant.id]: {
                name: updatedGrant.name,
                description: updatedGrant.description ?? "",
            },
        }));
        setRoles((current) => sortRoles(current.map((role) => ({
            ...role,
            grants: role.grants.map((grant) => grant.id === updatedGrant.id ? updatedGrant : grant),
        }))));
    }

    function removeGrant(grantId: string) {
        setGrants((current) => current.filter((grant) => grant.id !== grantId));
        setGrantDrafts((current) => {
            const next = {...current};
            delete next[grantId];
            return next;
        });
        setRoles((current) => sortRoles(current.map((role) => ({
            ...role,
            grants: role.grants.filter((grant) => grant.id !== grantId),
        }))));
    }

    async function handleCreateRole(formData: FormData) {
        setBusyKey("create");
        const result = await createRoleAction({
            name: String(formData.get("name") ?? ""),
        });

        if (!result.success || !result.data) {
            setFlash({tone: "error", message: result.message});
            setBusyKey(null);
            return;
        }

        setRoles((current) => sortRoles([...current, result.data!]));
        setSelectedRoleId(result.data.id);
        setCreateName("");
        setFlash({tone: "success", message: t("actions.created")});
        setBusyKey(null);
    }

    async function handleUpdateRole(formData: FormData) {
        if (!selectedRole) return;

        setBusyKey("update");
        const result = await updateRoleAction(selectedRole.id, {
            name: String(formData.get("name") ?? ""),
        });

        if (!result.success || !result.data) {
            setFlash({tone: "error", message: result.message});
            setBusyKey(null);
            return;
        }

        replaceRole(result.data);
        setFlash({tone: "success", message: t("actions.updated")});
        setBusyKey(null);
    }

    async function handleCreateGrant(formData: FormData) {
        setBusyKey("create-grant");
        const result = await createGrantAction({
            name: String(formData.get("name") ?? ""),
            description: String(formData.get("description") ?? "").trim() || undefined,
        });

        if (!result.success || !result.data) {
            setFlash({tone: "error", message: result.message});
            setBusyKey(null);
            return;
        }

        setGrants((current) => [...current, result.data!].sort((a, b) => a.name.localeCompare(b.name)));
        setGrantDrafts((current) => ({
            ...current,
            [result.data.id]: {
                name: result.data.name,
                description: result.data.description ?? "",
            },
        }));
        setCreateGrantName("");
        setCreateGrantDescription("");
        setFlash({tone: "success", message: t("actions.grantCreated")});
        setBusyKey(null);
    }

    async function handleUpdateGrant(grantId: string) {
        const draft = grantDrafts[grantId];
        if (!draft) return;

        setBusyKey(`update-grant-${grantId}`);
        const result = await updateGrantAction(grantId, {
            name: draft.name,
            description: draft.description.trim() || undefined,
        });

        if (!result.success || !result.data) {
            setFlash({tone: "error", message: result.message});
            setBusyKey(null);
            return;
        }

        replaceGrant(result.data);
        setFlash({tone: "success", message: t("actions.grantUpdated")});
        setBusyKey(null);
    }

    async function handleDeleteGrant(grantId: string) {
        setBusyKey(`delete-grant-${grantId}`);
        const result = await deleteGrantAction(grantId);

        if (!result.success) {
            setFlash({tone: "error", message: result.message});
            setBusyKey(null);
            return;
        }

        removeGrant(grantId);
        setFlash({tone: "success", message: t("actions.grantDeleted")});
        setBusyKey(null);
    }

    async function handleDeleteRole() {
        if (!selectedRole) return;

        setBusyKey("delete");
        const deletedRoleId = selectedRole.id;
        const result = await deleteRoleAction(deletedRoleId);

        if (!result.success) {
            setFlash({tone: "error", message: result.message});
            setBusyKey(null);
            return;
        }

        setRoles((current) => {
            const next = current.filter((role) => role.id !== deletedRoleId);
            setSelectedRoleId(next[0]?.id ?? null);
            return next;
        });
        setFlash({tone: "success", message: t("actions.deleted")});
        setBusyKey(null);
    }

    async function handleGrantMutation(grantId: string, assigned: boolean) {
        if (!selectedRole) return;

        setBusyKey(`${assigned ? "remove" : "add"}-${grantId}`);
        const result = assigned
            ? await removeGrantFromRoleAction(selectedRole.id, grantId)
            : await addGrantToRoleAction(selectedRole.id, grantId);

        if (!result.success || !result.data) {
            setFlash({tone: "error", message: result.message});
            setBusyKey(null);
            return;
        }

        replaceRole(result.data);
        setFlash({
            tone: "success",
            message: assigned ? t("actions.grantRemoved") : t("actions.grantAdded"),
        });
        setBusyKey(null);
    }

    const assignedGrantIds = new Set(selectedRole?.grants.map((grant) => grant.id) ?? []);
    const assignedGrants = selectedRole?.grants ?? [];

    return (
        <main className="p-6 pt-10">
            <div className="space-y-6">
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
                                <MetricCard title={t("stats.roles")} value={roles.length.toString()} accent="text-foreground" />
                                <MetricCard title={t("stats.grants")} value={grants.length.toString()} accent="text-foreground" />
                                <MetricCard title={t("stats.selected")} value={selectedRole ? assignedGrants.length.toString() : "0"} accent="text-foreground" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {flash && (
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
                )}

                {loadError && (
                    <Card className="border-destructive/50 bg-destructive/10">
                        <CardContent className="flex items-center justify-between gap-3 py-4">
                            <div className="flex items-center gap-3">
                                <ShieldAlert className="size-4 text-destructive" />
                                <p className="text-sm">{loadError}</p>
                            </div>
                            <Button variant="outline" onClick={() => setReloadKey((current) => current + 1)} disabled={loading}>
                                {t("retry")}
                            </Button>
                        </CardContent>
                    </Card>
                )}

                <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
                    <div className="space-y-6">
                        <Card className="border-slate-200/80 dark:border-slate-800">
                            <CardHeader className="space-y-3">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <CardTitle>{t("library.title")}</CardTitle>
                                        <CardDescription>{t("library.description")}</CardDescription>
                                    </div>
                                    <Badge variant="outline">{roles.length}</Badge>
                                </div>
                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        value={roleSearch}
                                        onChange={(event) => setRoleSearch(event.target.value)}
                                        placeholder={t("library.search")}
                                        className="pl-9"
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {loading ? (
                                    <div className="space-y-2">
                                        <div className="h-16 animate-pulse rounded-2xl bg-muted" />
                                        <div className="h-16 animate-pulse rounded-2xl bg-muted" />
                                        <div className="h-16 animate-pulse rounded-2xl bg-muted" />
                                    </div>
                                ) : filteredRoles.length > 0 ? (
                                    filteredRoles.map((role) => (
                                        <button
                                            key={role.id}
                                            type="button"
                                            onClick={() => setSelectedRoleId(role.id)}
                                            className={clsx(
                                                "w-full rounded-2xl border p-4 text-left transition",
                                                role.id === selectedRoleId
                                                    ? "border-amber-300 bg-amber-50 shadow-sm dark:border-amber-600/50 dark:bg-amber-950/20"
                                                    : "border-border/60 bg-background hover:border-amber-200 hover:bg-amber-50/60 dark:hover:border-amber-700/40 dark:hover:bg-amber-950/10"
                                            )}
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="truncate font-medium">{role.name}</p>
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        {t("library.grantCount")}
                                                        {role.grants.length}
                                                    </p>
                                                </div>
                                                <Badge variant={role.id === selectedRoleId ? "default" : "outline"}>
                                                    {role.grants.length}
                                                </Badge>
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                                        {roles.length === 0 ? t("library.empty") : t("library.noMatch")}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200/80 dark:border-slate-800">
                            <CardHeader>
                                <CardTitle>{t("create.title")}</CardTitle>
                                <CardDescription>{t("create.description")}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form action={handleCreateRole} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="role-create-name">{t("fields.name")}</Label>
                                        <Input
                                            id="role-create-name"
                                            name="name"
                                            value={createName}
                                            onChange={(event) => setCreateName(event.target.value)}
                                            placeholder={t("create.placeholder")}
                                            required
                                        />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={busyKey === "create"}>
                                        <Plus className="mr-2 size-4" />
                                        {busyKey === "create" ? t("create.submitting") : t("create.submit")}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200/80 dark:border-slate-800">
                            <CardHeader>
                                <CardTitle>{t("createGrant.title")}</CardTitle>
                                <CardDescription>{t("createGrant.description")}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form action={handleCreateGrant} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="grant-create-name">{t("createGrant.nameLabel")}</Label>
                                        <Input
                                            id="grant-create-name"
                                            name="name"
                                            value={createGrantName}
                                            onChange={(event) => setCreateGrantName(event.target.value)}
                                            placeholder={t("createGrant.namePlaceholder")}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="grant-create-description">{t("createGrant.descriptionLabel")}</Label>
                                        <Input
                                            id="grant-create-description"
                                            name="description"
                                            value={createGrantDescription}
                                            onChange={(event) => setCreateGrantDescription(event.target.value)}
                                            placeholder={t("createGrant.descriptionPlaceholder")}
                                        />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={busyKey === "create-grant"}>
                                        <Plus className="mr-2 size-4" />
                                        {busyKey === "create-grant" ? t("createGrant.submitting") : t("createGrant.submit")}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="border-slate-200/80 dark:border-slate-800">
                            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <CardTitle>{selectedRole?.name ?? t("detail.emptyTitle")}</CardTitle>
                                        {selectedRole && <Badge variant="outline">{assignedGrants.length}</Badge>}
                                    </div>
                                    <CardDescription>
                                        {selectedRole ? t("detail.description") : t("detail.emptyDescription")}
                                    </CardDescription>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Button variant="outline" onClick={() => setReloadKey((current) => current + 1)} disabled={loading || !!busyKey}>
                                        <RefreshCcw className="mr-2 size-4" />
                                        {t("refresh")}
                                    </Button>
                                    {selectedRole && (
                                        <form action={handleDeleteRole}>
                                            <Button type="submit" variant="destructive" disabled={busyKey === "delete"}>
                                                <Trash2 className="mr-2 size-4" />
                                                {busyKey === "delete" ? t("detail.deleting") : t("detail.delete")}
                                            </Button>
                                        </form>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {selectedRole ? (
                                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px]">
                                        <form action={handleUpdateRole} className="space-y-4 rounded-2xl border bg-muted/20 p-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="role-edit-name">{t("fields.name")}</Label>
                                                <Input
                                                    id="role-edit-name"
                                                    name="name"
                                                    value={editName}
                                                    onChange={(event) => setEditName(event.target.value)}
                                                    required
                                                />
                                            </div>
                                            <Button type="submit" disabled={busyKey === "update"}>
                                                <PencilLine className="mr-2 size-4" />
                                                {busyKey === "update" ? t("detail.saving") : t("detail.save")}
                                            </Button>
                                        </form>

                                        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                                            <div className="rounded-2xl border bg-background p-4">
                                                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{t("detail.stats.grants")}</p>
                                                <p className="mt-2 text-2xl font-semibold">{assignedGrants.length}</p>
                                            </div>
                                            <div className="rounded-2xl border bg-background p-4">
                                                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{t("detail.stats.id")}</p>
                                                <p className="mt-2 truncate text-sm font-medium text-muted-foreground">{selectedRole.id}</p>
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
                                            onChange={(event) => setGrantSearch(event.target.value)}
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
                                                            <form action={async () => handleGrantMutation(grant.id, true)}>
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
                                                                    onChange={(event) => setGrantDrafts((current) => ({
                                                                        ...current,
                                                                        [grant.id]: {
                                                                            name: event.target.value,
                                                                            description: draft.description,
                                                                        },
                                                                    }))}
                                                                    placeholder={t("createGrant.namePlaceholder")}
                                                                />
                                                                <Input
                                                                    value={draft.description}
                                                                    onChange={(event) => setGrantDrafts((current) => ({
                                                                        ...current,
                                                                        [grant.id]: {
                                                                            name: draft.name,
                                                                            description: event.target.value,
                                                                        },
                                                                    }))}
                                                                    placeholder={t("createGrant.descriptionPlaceholder")}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <form action={async () => handleUpdateGrant(grant.id)}>
                                                                <Button
                                                                    type="submit"
                                                                    variant="outline"
                                                                    disabled={busyKey === `update-grant-${grant.id}`}
                                                                >
                                                                    {busyKey === `update-grant-${grant.id}` ? t("grants.saving") : t("grants.save")}
                                                                </Button>
                                                            </form>
                                                            <form action={async () => handleDeleteGrant(grant.id)}>
                                                                <Button
                                                                    type="submit"
                                                                    variant="destructive"
                                                                    disabled={busyKey === `delete-grant-${grant.id}`}
                                                                >
                                                                    {busyKey === `delete-grant-${grant.id}` ? t("grants.deleting") : t("grants.delete")}
                                                                </Button>
                                                            </form>
                                                            {selectedRole ? (
                                                                <form action={async () => handleGrantMutation(grant.id, assigned)}>
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
                    </div>
                </div>
            </div>
        </main>
    );
}
