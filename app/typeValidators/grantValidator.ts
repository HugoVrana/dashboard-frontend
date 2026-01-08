import {GrantRead} from "@/app/models/auth/grantRead";

export function mapToGrantRead(x : unknown) : GrantRead | null {
    if (!isGrantRead(x)) {
        return null;
    }
    return {
        id : x.id,
        name: x.name,
        description: x.description
    }
}

export function isGrantRead(x : unknown) : x is GrantRead {
   if (!x || typeof x !== "object") return false;
    const o = x as Record<string, unknown>;
    return typeof  o.id == "string" &&
        typeof o.name === "string" &&
        typeof o.description === "string"
}