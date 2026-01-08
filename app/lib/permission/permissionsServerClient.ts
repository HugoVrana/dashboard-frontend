import {useSession} from "next-auth/react";

export function hasGrant(grantName: string): boolean {
    const { data: session } = useSession();
    if (!session) {
        return false;
    }
    return session.user.role.some((x: { grants: any[]; }) => x.grants?.some(y => y.name == grantName )) ?? false;
}

export function hasGrants(grantNames: string[]) : Record<string, boolean> {
    const { data: session } = useSession();

    if (!session) {
        return Object.fromEntries(grantNames.map(name => [name, false]));
    }

    return Object.fromEntries(
        grantNames.map(name => [
            name,
            session.user.role?.some(
                (x: { grants: any[] }) => x.grants?.some(y => y.name === name)
            ) ?? false
        ])
    );
}

export function getAllGrants() : String[] {
    const { data: session } = useSession();
    if (!session) {
        return [];
    }
    return session.user.role.flatMap((x: { grants: any[]; }) => x.grants?.map(y => y.name) ?? []);
}

export function getUserEmail() : string {
    const { data: session } = useSession();
    if (!session) {
        return "";
    }
    return session.user.email;
}

export function getAuthToken() : string {
    const { data: session } = useSession();
    if (!session) {
        return "";
    }
    return session.accessToken;
}

export function getUserGrants() : string[] {
    const { data: session } = useSession();
    if (!session) {
        return [];
    }
    return session.user.role?.flatMap((x: { grants: any[] }) => x.grants?.map(y => y.name) ?? []);
}

export function getUserRoles() : string[] {
    const { data: session } = useSession();
    if (!session) {
        return [];
    }
    return session.user.role?.flatMap((x : {name : string}) => x.name) ?? [];
}