import {isUserInfo, mapToUserInfo} from "@/app/typeValidators/userInfoValidator";
import {AuthResponse} from "@/app/models/auth/authResponse";

export function mapToAuthResponse(x : unknown) : AuthResponse | null {
    if (!isAuthResponse(x)) {
        return null;
    }
    return {
        accessToken : x.accessToken,
        refreshToken : x.refreshToken,
        expiresIn : x.expiresIn,
        user : mapToUserInfo(x.user)
    };
}

export function isAuthResponse(x : any) : x is AuthResponse {
    if (!x || typeof x !== "object") return false;
    const o = x as Record<string, unknown>;
    return typeof o.accessToken == "string" &&
        typeof o.refreshToken == "string" &&
        typeof o.expiresIn == "number" &&
        isUserInfo(o.user)
}