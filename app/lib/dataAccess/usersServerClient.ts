import GrafanaServerClient from "@/app/lib/dataAccess/grafanaServerClient";
import {RegisterRequest} from "@/app/models/auth/registerRequest";
import {isUserInfo, mapToUserInfo} from "@/app/typeValidators/userInfoValidator";
import {LoginRequest} from "@/app/models/auth/loginRequest";
import {AuthResponse} from "@/app/models/auth/authResponse";
import {UserInfo} from "@/app/models/auth/userInfo";
import {isAuthResponse, mapToAuthResponse} from "@/app/typeValidators/authResponseValidator";

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
                "Access-Control-Allow-Origin": "*"
                // Don't ever add auth token here
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
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            }
        });

        if (!res.ok) {
            console.error("API error", res.status, res.statusText);
            return null;
        }

        const text : string = await res.text();
        if (!text || text.trim() === '') {
            grafanaClient.error("Empty response body, returning no user", {route: "POST /auth/login"});
            console.log("Empty response body, returning null");
            return Promise.resolve(null);
        }

        const data : unknown = JSON.parse(text);
        if (!isAuthResponse(data)) {
            grafanaClient.error("Unexpected payload:", {route: "POST /auth/login", payload: data});
            console.error("Unexpected payload:", data);
            return Promise.resolve(null);
        }

        const authResponse : AuthResponse | null = mapToAuthResponse(data);
        if (!authResponse) {
            grafanaClient.error("Unexpected payload:", {route: "POST /auth/login", payload: data});
            console.error("Unexpected payload:", data);
            return Promise.resolve(null);
        }
        return Promise.resolve(authResponse);

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

export async function postUserProfilePicture(
    serverUrl: string,
    accessToken: string,
    file: File
): Promise<string | null> {
    try {
        const url = new URL("api/user/profilePicture", serverUrl);

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