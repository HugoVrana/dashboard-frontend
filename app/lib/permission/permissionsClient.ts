"use client"

import { useSession } from "next-auth/react";

export function getUserEmail(): string {
    const { data: session } = useSession();
    return session?.user?.email ?? "";
}

export function getAuthToken(): string {
    const { data: session } = useSession();
    return session?.accessToken ?? "";
}

export function getUserGrants(): string[] {
    const { data: session } = useSession();
    if (!session) return [];
    return session.user?.role?.flatMap((x: { grants: any[] }) =>
        x.grants?.map(y => y.name) ?? []
    ) ?? [];
}

export function getUserRoles(): string[] {
    const { data: session } = useSession();
    if (!session) return [];
    return session.user?.role?.map((x: { name: string }) => x.name) ?? [];
}

export function hasGrant(grantName: string): boolean {
    const { data: session } = useSession();
    if (!session) return false;
    return session.user?.role?.some(
        (x: { grants: any[] }) => x.grants?.some(y => y.name === grantName)
    ) ?? false;
}