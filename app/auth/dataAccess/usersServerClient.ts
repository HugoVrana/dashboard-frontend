import {buildAuthApiUrl} from "@/app/auth/dashboardAuthApiContext";
import {isUserInfo, mapToUserInfo} from "@/app/auth/typeValidators/userInfoValidator";
import GrafanaServerClient from "@/app/shared/dataAccess/grafanaServerClient";
import {RegisterRequest} from "@/app/auth/models/authMessaging/registerRequest";
import {UserInfo} from "@/app/auth/models/user/userInfo";
import {LoginRequest} from "@/app/auth/models/authMessaging/loginRequest";
import {AuthResponse} from "@/app/auth/models/authMessaging/authResponse";
import {isAuthResponse, mapToAuthResponse} from "@/app/auth/typeValidators/authResponseValidator";
import {TotpSetupResponse, TotpSetupResponseSchema} from "@/app/auth/models/authMessaging/totpSetupResponse";
import {headers as nextHeaders} from "next/headers";

const grafanaClient : GrafanaServerClient = new GrafanaServerClient();

async function buildBaseHeaders(accessToken?: string): Promise<Record<string, string>> {
    const origin = await getRequestOrigin();
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Origin": origin,
        "X-Client-Id": process.env.OAUTH2_CLIENT_ID ?? "69c69004ea37f177fad373d3",
    };
    if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return headers;
}

async function getRequestOrigin(): Promise<string> {
    const requestHeaders = await nextHeaders();
    const requestOrigin = requestHeaders.get("origin");
    if (requestOrigin) {
        return requestOrigin;
    }

    const referer = requestHeaders.get("referer");
    if (referer) {
        return new URL(referer).origin;
    }

    return process.env.NEXT_PUBLIC_APP_URL
        ?? process.env.NEXTAUTH_URL
        ?? "http://localhost:3000";
}

export async function createUser(serverUrl : string, registerRequest : RegisterRequest) : Promise<UserInfo | null> {
    try {
        console.log("creating user");
        const url = buildAuthApiUrl(serverUrl, "auth/register");

        const res : Response = await fetch(url.toString(), {
            method: "POST",
            body : JSON.stringify(registerRequest),
            headers : await buildBaseHeaders()
        });

        if (!res.ok) {
            const responseBody = await res.text();
            console.error("API error", res.status, res.statusText, responseBody);
            grafanaClient.error("API error", {
                route: "POST /api/v2/auth/register",
                status: res.status,
                statusText: res.statusText,
                responseBody,
            });
            return null;
        }

        const result  = await res.json();
        console.log("Created User : " + result);
        grafanaClient.info("Created User", {route : "POST /api/auth/register", user : result});

        if (!isUserInfo(result)) {
            grafanaClient.error("Unexpected payload:", {route: "POST /api/auth/register", payload: result});
            console.error("Unexpected payload:", result);
            return null;

        }

        let userinfo : UserInfo | null = mapToUserInfo(result);
        if (!userinfo) {
            grafanaClient.error("Unexpected payload:", {route: "POST /api/auth/register", payload: result});
            console.error("Unexpected payload:", result);
            return null;
        }

        if (!userinfo.id) {
            grafanaClient.error("Unexpected payload:", {route: "POST /api/auth/register", payload: result});
            console.error("Unexpected payload:", result);
        }

        grafanaClient.info("Created User", {route : "POST /api/auth/register", response : userinfo});

        return userinfo;

    } catch (e) {
        console.error("Post failed:", e);
        grafanaClient.error("Post failed", {route: "POST /api/auth/register", error: e});
        return null;
    }
}

export async function loginUserWithTokens(
    serverUrl: string,
    loginRequest: LoginRequest
): Promise<AuthResponse | null> {
    try {
        const url = buildAuthApiUrl(serverUrl, "auth/login");

        const res : Response = await fetch(url.toString(), {
            method : "POST",
            body : JSON.stringify(loginRequest),
            headers : await buildBaseHeaders()
        });

        if (!res.ok) {
            console.error("API error", res.status, res.statusText);
            return null;
        }

        const text : string = await res.text();
        if (!text || text.trim() === '') {
            grafanaClient.error("Empty response body, returning no user", {route: "POST /auth/login"});
            console.log("Empty response body, returning null");
            return null;
        }

        const data : unknown = JSON.parse(text);
        if (!isAuthResponse(data)) {
            grafanaClient.error("Unexpected payload:", {route: "POST /auth/login", payload: data});
            console.error("Unexpected payload:", data);
            return null;
        }

        const authResponse : AuthResponse | null = mapToAuthResponse(data);
        if (!authResponse) {
            grafanaClient.error("Unexpected payload:", {route: "POST /auth/login", payload: data});
            console.error("Unexpected payload:", data);
            return null;
        }
        return authResponse;

    } catch (e) {
        console.error("Post failed:", e);
        return null;
    }
}

 export async function logoutUserWithToken(
     serverUrl: string,
     accessToken: string,
     refreshToken: string
 ): Promise<boolean> {
     try {
         const url = buildAuthApiUrl(serverUrl, "auth/logout");
         const res: Response = await fetch(url.toString(), {
             method: "POST",
             headers: await buildBaseHeaders(accessToken)
         });
         return res.ok;
     } catch (e) {
         console.error("Logout failed:", e);
         return false;
     }
 }

export async function postUserProfilePicture(
    serverUrl: string,
    accessToken: string,
    file: File
): Promise<string | null> {
    try {
        const url = buildAuthApiUrl(serverUrl, "user/profilePicture");

        const formData = new FormData();
        formData.append("file", file);

        const res: Response = await fetch(url.toString(), {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`
            },
            body: formData
        });

        if (!res.ok) {
            console.error("API error", res.status, res.statusText);
            grafanaClient.error("API error", {
                route: "POST /api/user/profilePicture",
                status: res.status,
                statusText: res.statusText
            });
            return null;
        }

        const publicUrl : string = await res.text();
        grafanaClient.info("Profile picture uploaded", {
            route: "POST /api/user/profilePicture",
            publicUrl
        });

        return publicUrl;
    } catch (e) {
        console.error("Setting profile pic failed:", e);
        grafanaClient.error("Setting profile pic failed", {
            route: "POST /api/user/profilePicture",
            error: e
        });
        return null;
    }
}

export async function setupTotp(
    serverUrl: string,
    accessToken: string
): Promise<TotpSetupResponse | null> {
    try {
        const url = buildAuthApiUrl(serverUrl, "auth/2fa/setup");

        const res: Response = await fetch(url.toString(), {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        if (!res.ok) {
            console.error("API error", res.status, res.statusText);
            grafanaClient.error("API error", {
                route: "POST /api/auth/setupTotp",
                status: res.status,
                statusText: res.statusText
            });
            return null;
        }

        const text: string = await res.text();
        if (!text || text.trim() === '') {
            grafanaClient.error("Empty response body", {route: "POST /api/auth/setupTotp"});
            console.log("Empty response body, returning null");
            return null;
        }

        const data: unknown = JSON.parse(text);
        const parsed = TotpSetupResponseSchema.safeParse(data);

        if (!parsed.success) {
            grafanaClient.error("Unexpected payload:", {
                route: "POST /api/auth/setupTotp",
                payload: data,
                error: parsed.error
            });
            console.error("Unexpected payload:", data);
            return null;
        }

        grafanaClient.info("TOTP setup successful", {route: "POST /api/auth/setupTotp"});
        return parsed.data;
    } catch (e) {
        console.error("TOTP setup failed:", e);
        grafanaClient.error("TOTP setup failed", {
            route: "POST /api/auth/setupTotp",
            error: e
        });
        return null;
    }
}

export async function verifyTotp(
    serverUrl: string,
    accessToken: string,
    code: string
): Promise<boolean> {
    try {
        const url = buildAuthApiUrl(serverUrl, "auth/2fa/verify");

        const res: Response = await fetch(url.toString(), {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ code })
        });

        if (!res.ok) {
            console.error("TOTP verification failed", res.status, res.statusText);
            grafanaClient.error("TOTP verification failed", {
                route: "POST /api/auth/2fa/verify",
                status: res.status,
                statusText: res.statusText
            });
            return false;
        }

        grafanaClient.info("TOTP verified successfully", {route: "POST /api/auth/2fa/verify"});
        return true;
    } catch (e) {
        console.error("TOTP verification error:", e);
        grafanaClient.error("TOTP verification error", {
            route: "POST /api/auth/2fa/verify",
            error: e
        });
        return false;
    }
}
