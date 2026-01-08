"use client"

import {getSession, useSession} from "next-auth/react";
import {Session} from "next-auth";

export async function getAuthToken(): Promise<string> {
    const session : Session | null = await getSession();

    if (!session?.accessToken) {
        return "";
    }

    return session.accessToken;
}

export function hasGrant(grantName: string): boolean {
    const { data: session } = useSession();

    if (!session?.user?.role) {
        return false;
    }

    return session.user.role.some((role: { grants: any[]; }) =>
        role.grants?.some(grant  => grant.name === grantName)
    );
}