import {auth} from "@/auth";

export async function hasGrant(grantName: string): Promise<boolean> {
    const session = await auth();
    if (!session) {
        return false;
    }
    return session.user.role.some((x: { grants: any[]; }) => x.grants?.some(y => y.name == grantName)) ?? false;
}

export async function hasGrants(grantNames: string[]): Promise<Record<string, boolean>> {
    const session = await auth();

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

export async function getAllGrants(): Promise<string[]> {
    const session = await auth();
    if (!session) {
        return [];
    }
    return session.user.role.flatMap((x: { grants: any[]; }) => x.grants?.map(y => y.name) ?? []);
}

export async function getUserEmail(): Promise<string> {
    const session = await auth();
    if (!session) {
        return "";
    }
    return session.user.email;
}

export async function getAuthToken(): Promise<string> {
    const session = await auth();
    if (!session) {
        return "";
    }
    return session.accessToken;
}

export async function getUserGrants(): Promise<string[]> {
    const session = await auth();
    if (!session) {
        return [];
    }
    return session.user.role?.flatMap((x: { grants: any[] }) => x.grants?.map(y => y.name) ?? []);
}

export async function getUserRoles(): Promise<string[]> {
    const session = await auth();
    if (!session) {
        return [];
    }
    return session.user.role?.flatMap((x: { name: string }) => x.name) ?? [];
}

export async function getUserImageLink(): Promise<string> {
    const session = await auth();
    if (!session) {
        return "";
    }
    return session.user?.image ?? "";
}
