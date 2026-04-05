"use client"

import {useSession} from "next-auth/react";
import {useMemo} from "react";

export function usePermissions() {
    const { data: session, status } = useSession();

    const userEmail = useMemo(() => {
        return session?.user?.email ?? "";
    }, [session?.user?.email]);

    const getAuthToken = useMemo(() => {
        return session?.accessToken ?? "";
    }, [session?.accessToken]);

    const userGrants = useMemo(() => {
        return session?.user?.grants ?? [];
    }, [session?.user?.grants]);

    const userRoles = useMemo(() => {
        if (!session) return [];
        return session.user?.role?.map((x: { name: string }) => x.name) ?? [];
    }, [session]);

    const getUserGrants = useMemo(() => {
        return (): string[] => session?.user?.grants ?? [];
    }, [session?.user?.grants]);

    const hasGrant = useMemo(() => {
        return (grantName: string): boolean => {
            return session?.user?.grants?.includes(grantName) ?? false;
        };
    }, [session?.user?.grants]);

    const hasRole = useMemo(() => {
        return (roleName: string): boolean => {
            if (!session) return false;
            return session.user?.role?.some(
                (x: { name: string }) => x.name === roleName
            ) ?? false;
        };
    }, [session]);

    return {
        session,
        status,
        isAuthenticated: status === "authenticated",
        isLoading: status === "loading",
        userEmail,
        getAuthToken,
        userGrants,
        userRoles,
        getUserGrants,
        hasGrant,
        hasRole,
    };
}