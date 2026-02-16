import {isRole} from "@/app/typeValidators/roleValidator";
import {UserInfo} from "@/app/models/auth/userInfo";

function isValidUrlOrEmpty(value: unknown): boolean {
    if (value === null || value === undefined) return true;
    if (typeof value !== 'string') return false;
    if (value === '') return true;
    try {
        new URL(value);
        return true;
    } catch {
        return false;
    }
}

export function mapToUserInfo(x : unknown) : UserInfo | null {
 if (isUserInfo(x)) {
     return {
         id : x.id,
         email : x.email,
         roleReads : x.roleReads,
         profileImageUrl : x.profileImageUrl || null
     }
 }
 return null;
}

export function isUserInfo(x : unknown): x is UserInfo {
    if (!x || typeof x !== "object") return false;
    const o = x as Record<string, unknown>;
    return typeof o.id == "string" &&
        typeof o.email == "string" &&
        isValidUrlOrEmpty(o.profileImageUrl) &&
        Array.isArray(o.roleReads) &&
        o.roleReads.every(r => isRole(r));
}