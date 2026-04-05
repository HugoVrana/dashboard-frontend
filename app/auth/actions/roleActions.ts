"use server";

import {auth} from "@/auth";
import {getRoles, getRole, createRole, updateRole, deleteRole, addGrantToRole, removeGrantFromRole} from "@/app/auth/dataAccess/rolesServerClient";
import {CreateRole, CreateRoleSchema} from "@/app/auth/models/role/createRole";
import {RoleUpdate, RoleUpdateSchema} from "@/app/auth/models/role/roleUpdate";
import {RoleRead} from "@/app/auth/models/role/roleRead";

async function getSession() {
    const session = await auth();
    if (!session?.accessToken || !session?.url) return null;
    return session;
}

export async function getRolesAction(): Promise<{ success: boolean; message: string; data?: RoleRead[] }> {
    const session = await getSession();
    if (!session) return { success: false, message: "Not authenticated" };

    const data = await getRoles(session.url, session.accessToken);
    if (!data) return { success: false, message: "Failed to fetch roles" };

    return { success: true, message: "OK", data };
}

export async function getRoleAction(id: string): Promise<{ success: boolean; message: string; data?: RoleRead }> {
    const session = await getSession();
    if (!session) return { success: false, message: "Not authenticated" };

    const data = await getRole(session.url, session.accessToken, id);
    if (!data) return { success: false, message: "Role not found" };

    return { success: true, message: "OK", data };
}

export async function createRoleAction(body: CreateRole): Promise<{ success: boolean; message: string; data?: RoleRead }> {
    const session = await getSession();
    if (!session) return { success: false, message: "Not authenticated" };

    const parsed = CreateRoleSchema.safeParse(body);
    if (!parsed.success) return { success: false, message: parsed.error.errors[0].message };

    const data = await createRole(session.url, session.accessToken, parsed.data);
    if (!data) return { success: false, message: "Failed to create role" };

    return { success: true, message: "Role created", data };
}

export async function updateRoleAction(id: string, body: RoleUpdate): Promise<{ success: boolean; message: string; data?: RoleRead }> {
    const session = await getSession();
    if (!session) return { success: false, message: "Not authenticated" };

    const parsed = RoleUpdateSchema.safeParse(body);
    if (!parsed.success) return { success: false, message: parsed.error.errors[0].message };

    const data = await updateRole(session.url, session.accessToken, id, parsed.data);
    if (!data) return { success: false, message: "Failed to update role" };

    return { success: true, message: "Role updated", data };
}

export async function deleteRoleAction(id: string): Promise<{ success: boolean; message: string }> {
    const session = await getSession();
    if (!session) return { success: false, message: "Not authenticated" };

    const ok = await deleteRole(session.url, session.accessToken, id);
    if (!ok) return { success: false, message: "Failed to delete role" };

    return { success: true, message: "Role deleted" };
}

export async function addGrantToRoleAction(roleId: string, grantId: string): Promise<{ success: boolean; message: string; data?: RoleRead }> {
    const session = await getSession();
    if (!session) return { success: false, message: "Not authenticated" };

    const data = await addGrantToRole(session.url, session.accessToken, roleId, grantId);
    if (!data) return { success: false, message: "Failed to add grant to role" };

    return { success: true, message: "Grant added to role", data };
}

export async function removeGrantFromRoleAction(roleId: string, grantId: string): Promise<{ success: boolean; message: string; data?: RoleRead }> {
    const session = await getSession();
    if (!session) return { success: false, message: "Not authenticated" };

    const data = await removeGrantFromRole(session.url, session.accessToken, roleId, grantId);
    if (!data) return { success: false, message: "Failed to remove grant from role" };

    return { success: true, message: "Grant removed from role", data };
}
