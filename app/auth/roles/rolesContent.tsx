"use client"

import {useContext, useDeferredValue, useEffect, useState} from "react";
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
import RolesHeader from "@/app/auth/components/roles/rolesHeader";
import {RolesLoadError} from "@/app/auth/components/roles/rolesStatus";
import RolesLibraryCard from "@/app/auth/components/roles/rolesLibraryCard";
import CreateRoleCard from "@/app/auth/components/roles/createRoleCard";
import CreateGrantCard from "@/app/auth/components/roles/createGrantCard";
import RoleDetailCard from "@/app/auth/components/roles/roleDetailCard";
import RoleGrantsCard from "@/app/auth/components/roles/roleGrantsCard";
import type {RoleRead} from "@/app/auth/models/role/roleRead";
import type {GrantRead} from "@/app/auth/models/grant/grantRead";
import {FlashState} from "@/app/auth/models/components/flashState";
import {RolesFlash} from "@/app/auth/components/roles/roleFlash";

function sortRoles(roles: RoleRead[]): RoleRead[] {
    return [...roles].sort((a, b) => a.name.localeCompare(b.name));
}

export default function RolesContent() {
    const t = useDebugTranslations("dashboard.roles");
    const {isReady: apiContextReady} = useContext(ApiContext);
    const {isLoading: permissionsLoading, isAuthenticated, hasGrant} = usePermissions();

    const canCreateRole : boolean = hasGrant("dashboard-oauth-role-create");
    const canEditRole : boolean = hasGrant("dashboard-oauth-role-update");
    const canManageRoleGrants : boolean = hasGrant("dashboard-oauth-role-manage-grants");
    const canDeleteRole : boolean = hasGrant("dashboard-oauth-role-delete");
    const canCreateGrant : boolean = hasGrant("dashboard-oauth-grant-create");
    const canUpdateGrant : boolean = hasGrant("dashboard-oauth-grant-update");
    const canDeleteGrant : boolean = hasGrant("dashboard-oauth-grant-delete");

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

        const createdGrant = result.data;

        setGrants((current) => [...current, createdGrant].sort((a, b) => a.name.localeCompare(b.name)));
        setGrantDrafts((current) => ({
            ...current,
            [createdGrant.id]: {
                name: createdGrant.name,
                description: createdGrant.description ?? "",
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
                <RolesHeader
                    roleCount={roles.length}
                    grantCount={grants.length}
                    selectedGrantCount={selectedRole ? assignedGrants.length : 0}
                />

                {flash && <RolesFlash {...flash} />}

                <RolesLoadError
                    loadError={loadError}
                    loading={loading}
                    onRetry={() => setReloadKey((current) => current + 1)}
                />

                <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
                    <div className="space-y-6">
                        <RolesLibraryCard
                            roles={roles}
                            filteredRoles={filteredRoles}
                            loading={loading}
                            roleSearch={roleSearch}
                            selectedRoleId={selectedRoleId}
                            onRoleSearchChange={setRoleSearch}
                            onRoleSelect={setSelectedRoleId}
                        />

                        {canCreateRole && (
                            <CreateRoleCard
                                createName={createName}
                                busy={busyKey === "create"}
                                onNameChange={setCreateName}
                                onSubmit={handleCreateRole}
                            />
                        )}

                        {canCreateGrant && (
                            <CreateGrantCard
                                name={createGrantName}
                                description={createGrantDescription}
                                busy={busyKey === "create-grant"}
                                onNameChange={setCreateGrantName}
                                onDescriptionChange={setCreateGrantDescription}
                                onSubmit={handleCreateGrant}
                            />
                        )}
                    </div>

                    <div className="space-y-6">
                        <RoleDetailCard
                            selectedRole={selectedRole}
                            assignedGrantCount={assignedGrants.length}
                            editName={editName}
                            loading={loading}
                            busyKey={busyKey}
                            canEdit={canEditRole}
                            canDelete={canDeleteRole}
                            onEditNameChange={setEditName}
                            onRefresh={() => setReloadKey((current) => current + 1)}
                            onUpdateRole={handleUpdateRole}
                            onDeleteRole={handleDeleteRole}
                        />

                        <RoleGrantsCard
                            selectedRole={selectedRole}
                            assignedGrantIds={assignedGrantIds}
                            assignedGrants={assignedGrants}
                            visibleGrants={visibleGrants}
                            grantDrafts={grantDrafts}
                            grantSearch={grantSearch}
                            busyKey={busyKey}
                            canManageRoleGrants={canManageRoleGrants}
                            canUpdateGrant={canUpdateGrant}
                            canDeleteGrant={canDeleteGrant}
                            onGrantSearchChange={setGrantSearch}
                            onGrantDraftChange={(grantId, patch) => setGrantDrafts((current) => ({
                                ...current,
                                [grantId]: {
                                    name: patch.name ?? current[grantId]?.name ?? "",
                                    description: patch.description ?? current[grantId]?.description ?? "",
                                },
                            }))}
                            onGrantMutation={handleGrantMutation}
                            onUpdateGrant={handleUpdateGrant}
                            onDeleteGrant={handleDeleteGrant}
                        />
                    </div>
                </div>
            </div>
        </main>
    );
}
