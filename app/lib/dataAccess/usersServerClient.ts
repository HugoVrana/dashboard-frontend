import GrafanaServerClient from "@/app/lib/dataAccess/grafanaServerClient";
import {RegisterRequest} from "@/app/models/auth/registerRequest";
import {getAuthToken} from "@/app/lib/permission/permissionsServerClient";
import {isUserInfo, mapToUserInfo} from "@/app/typeValidators/userInfoValidator";
import {LoginRequest} from "@/app/models/auth/loginRequest";
import {AuthResponse} from "@/app/models/auth/authResponse";
import {UserInfo} from "@/app/models/auth/userInfo";

const grafanaClient : GrafanaServerClient = new GrafanaServerClient();

export async function createUser(serverUrl : string, registerRequest : RegisterRequest) : Promise<UserInfo | null> {
    try {
        const url = new URL("api/auth/register", serverUrl);

        registerRequest.roleId = "6939575c98f5fc7bd2216a79";

        const res : Response = await fetch(url.toString(), {
            method: "POST",
            body : JSON.stringify(registerRequest),
            headers : {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                Authorization : `Bearer ${await getAuthToken()}`
            }
        });

        if (!res.ok) {
            console.error("API error", res.status, res.statusText);
            grafanaClient.error("API error", {route: "POST /api/auth/register", status: res.status, statusText: res.statusText});
            return Promise.resolve(null);
        }

        const result  = await res.json();
        console.log("Created User : " + result);
        grafanaClient.info("Created User", {route : "POST /api/auth/register", user : result});

        if (!isUserInfo(result)) {
            grafanaClient.error("Unexpected payload:", {route: "POST /api/auth/register", payload: result});
            console.error("Unexpected payload:", result);
            return Promise.resolve(null);

        }

        let userinfo : UserInfo | null = mapToUserInfo(result);
        if (!userinfo) {
            grafanaClient.error("Unexpected payload:", {route: "POST /api/auth/register", payload: result});
            console.error("Unexpected payload:", result);
            return Promise.resolve(null);
        }

        if (!userinfo.id) {
            grafanaClient.error("Unexpected payload:", {route: "POST /api/auth/register", payload: result});
            console.error("Unexpected payload:", result);
        }

        grafanaClient.info("Created User", {route : "POST /api/auth/register", response : userinfo});

        return Promise.resolve(userinfo);

    } catch (e) {
        console.error("Post failed:", e);
        grafanaClient.error("Post failed", {route: "POST /api/auth/register", error: e});
        return Promise.resolve(null);
    }
}

export async function loginUserWithTokens(
    serverUrl: string,
    loginRequest: LoginRequest
): Promise<AuthResponse | null> {
    try {
        const url = new URL("api/auth/login", serverUrl);

        const res : Response = await fetch(url.toString(), {
            method : "POST",
            body : JSON.stringify(loginRequest),
            headers : {
                "Content-Type": "application/json"
            }
        });

        if (!res.ok) {
            console.error("API error", res.status, res.statusText);
            return null;
        }
        return await res.json();
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
         const url = new URL("api/auth/logout", serverUrl);
         const res: Response = await fetch(url.toString(), {
             method: "POST",
             headers: {
                 Authorization : `Bearer ${accessToken}`
             }
         });
         return res.ok;
     } catch (e) {
         console.error("Logout failed:", e);
         return false;
     }
 }