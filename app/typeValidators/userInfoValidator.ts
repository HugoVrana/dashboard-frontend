import {isRole} from "@/app/typeValidators/roleValidator";
import {UserInfo} from "@/app/models/auth/userInfo";

export function mapToUserInfo(x : unknown) : UserInfo | null {
 if (isUserInfo(x)) {
     return {
         id : x.id,
         email : x.email,
         roleReads : x.roleReads
     }
 }
 return null;
}

export function isUserInfo(x : unknown): x is UserInfo {
    if (!x || typeof x !== "object") return false;
    const o = x as Record<string, unknown>;
    return typeof o.id == "string" &&
        typeof o.email == "string" &&
        Array.isArray(o.roleReads) &&
        o.roleReads.every(r => isRole(r));
}