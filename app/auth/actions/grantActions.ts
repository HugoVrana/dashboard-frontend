"use server";

import {auth} from "@/auth";
import {createGrant, updateGrant, deleteGrant} from "@/app/auth/dataAccess/grantsServerClient";
import {GrantCreate, GrantCreateSchema} from "@/app/auth/models/grant/grantCreate";
import {GrantUpdate, GrantUpdateSchema} from "@/app/auth/models/grant/grantUpdate";
import {GrantRead} from "@/app/auth/models/grant/grantRead";
import {Session} from "next-auth";

async function getSession() {
    const session = await auth();
    if (!session?.accessToken || !session?.url) return null;
    return session;
}

export async function createGrantAction(body: GrantCreate): Promise<{ success: boolean; message: string; data?: GrantRead }> {
    const session : Session | null = await getSession();
    if (!session) {
        return {success: false, message: "Not authenticated" };
    }

    const parsed = GrantCreateSchema.safeParse(body);
    if (!parsed.success) {
        return { success: false, message: parsed.error.errors[0].message };
    }

    const data = await createGrant(session.url, session.accessToken, parsed.data);
    if (!data) {
        return { success: false, message: "Failed to create grant" };
    }

    return { success: true, message: "Grant created", data };
}

export async function updateGrantAction(id: string, body: GrantUpdate): Promise<{ success: boolean; message: string; data?: GrantRead }> {
    const session : Session | null = await getSession();
    if (!session) {
        return {success: false, message: "Not authenticated" };
    }

    const parsed = GrantUpdateSchema.safeParse(body);
    if (!parsed.success) {
        return { success: false, message: parsed.error.errors[0].message };
    }

    const data = await updateGrant(session.url, session.accessToken, id, parsed.data);
    if (!data) {
        return { success: false, message: "Failed to update grant" };
    }

    return { success: true, message: "Grant updated", data };
}

export async function deleteGrantAction(id: string): Promise<{ success: boolean; message: string }> {
    const session : Session | null = await getSession();
    if (!session) {
        return {success: false, message: "Not authenticated" };
    }

    const ok : boolean = await deleteGrant(session.url, session.accessToken, id);
    if (!ok) {
        return{ success: false, message: "Failed to delete grant" };
    }

    return { success: true, message: "Grant deleted" };
}
