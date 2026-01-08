"use client"

import { useSession } from "next-auth/react";

export function useUserEmail(): string {
    const { data: session } = useSession();
    return session?.user?.email ?? "";
}

export function useAuthToken(): string {
    const { data: session } = useSession();
    return session?.accessToken ?? "";
}

export function useUserGrants(): string[] {
    const { data: session } = useSession();
    if (!session) return [];
    return session.user?.role?.flatMap((x: { grants: any[] }) =>
        x.grants?.map(y => y.name) ?? []
    ) ?? [];
}

export function useUserRoles(): string[] {
    const { data: session } = useSession();
    if (!session) return [];
    return session.user?.role?.map((x: { name: string }) => x.name) ?? [];
}

export function useHasGrant(grantName: string): boolean {
    const { data: session } = useSession();
    if (!session) return false;
    return session.user?.role?.some(
        (x: { grants: any[] }) => x.grants?.some(y => y.name === grantName)
    ) ?? false;
}