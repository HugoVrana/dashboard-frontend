import {isGrantRead, mapToGrantRead} from "@/app/typeValidators/grantValidator";
import {RoleRead} from "@/app/models/auth/role";

export function mapToRole(x : unknown) : RoleRead | null {
    if (isRole(x)) {
        return {
            id : x.id,
            name: x.name,
            grants : x.grants
                .map(mapToGrantRead)
                .filter(g => g !== null)
        };
    }
    return null;
}

export function isRole(x : unknown) : x is RoleRead {
    if (!x || typeof x !== "object") return false;
    const o = x as Record<string, unknown>;
    return typeof  o.id == "string" &&
       typeof o.name === "string" &&
        Array.isArray(o.grants) &&
        o.grants.every(g => isGrantRead(g))
}