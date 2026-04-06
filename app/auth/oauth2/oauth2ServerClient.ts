import {generateCodeChallenge, generateCodeVerifier} from "@/app/auth/oauth2/pkce";
import {isUserInfo, mapToUserInfo} from "@/app/auth/typeValidators/userInfoValidator";
import GrafanaServerClient from "@/app/shared/dataAccess/grafanaServerClient";
import {UserInfo} from "@/app/auth/models/user/userInfo";
import {OAuth2TokenResponse} from "@/app/auth/models/authMessaging/oauth2TokenResponse";
import {MfaRequiredResponse} from "@/app/auth/models/authMessaging/oauth2ErrorResponse";

const grafanaClient: GrafanaServerClient = new GrafanaServerClient();

const OAUTH2_CLIENT_ID = process.env.OAUTH2_CLIENT_ID ?? "dashboard-frontend";
const OAUTH2_CLIENT_SECRET = process.env.OAUTH2_CLIENT_SECRET;
const OAUTH2_REDIRECT_URI = process.env.OAUTH2_REDIRECT_URI ?? "http://localhost:3000/api/auth/callback/mfa";
const OAUTH2_ORIGIN = new URL(OAUTH2_REDIRECT_URI).origin;

export interface OAuth2AuthResult {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: UserInfo | null;
}

export interface OAuth2MfaRequired {
    mfaRequired: true;
    mfaToken: string;
    codeVerifier: string;
    serverUrl: string;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function initiatePkce(serverUrl: string): Promise<{ requestId: string; codeVerifier: string } | null> {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const requestId = await initiateAuthorize(serverUrl, codeChallenge);
    if (!requestId) return null;
    return { requestId, codeVerifier };
}

export async function loginWithOAuth2(
    serverUrl: string,
    email: string,
    password: string,
    existingPkce?: { requestId: string; codeVerifier: string }
): Promise<OAuth2AuthResult | OAuth2MfaRequired | null> {

    let codeVerifier: string;
    let requestId: string;

    if (existingPkce) {
        codeVerifier = existingPkce.codeVerifier;
        requestId = existingPkce.requestId;
    } else {
        codeVerifier = generateCodeVerifier();
        const codeChallenge = await generateCodeChallenge(codeVerifier);
        const initiatedId = await initiateAuthorize(serverUrl, codeChallenge);
        if (!initiatedId) return null;
        requestId = initiatedId;
    }

    const submitResult = await submitAuthorize(serverUrl, requestId, email, password);
    if (!submitResult) return null;

    if (submitResult.mfaRequired) {
        return {
            mfaRequired: true,
            mfaToken: submitResult.mfaToken!,
            codeVerifier,
            serverUrl,
        };
    }

    const tokens = await exchangeCodeForTokens(serverUrl, submitResult.code!, codeVerifier);
    if (!tokens) return null;

    const user = await fetchUserInfo(serverUrl, tokens.access_token!);

    return {
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token!,
        expiresIn: tokens.expires_in!,
        user,
    };
}

export async function completeMfaLogin(
    serverUrl: string,
    mfaToken: string,
    totpCode: string,
    codeVerifier: string
): Promise<OAuth2AuthResult | null> {

    const authCode = await submitMfa(serverUrl, mfaToken, totpCode);
    if (!authCode) return null;

    const tokens = await exchangeCodeForTokens(serverUrl, authCode, codeVerifier);
    if (!tokens) return null;

    const user = await fetchUserInfo(serverUrl, tokens.access_token!);

    return {
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token!,
        expiresIn: tokens.expires_in!,
        user,
    };
}

export async function refreshAccessToken(
    serverUrl: string,
    refreshToken: string
): Promise<OAuth2TokenResponse | null> {
    try {
        const body = new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: refreshToken,
            client_id: OAUTH2_CLIENT_ID,
            ...(OAUTH2_CLIENT_SECRET && {client_secret: OAUTH2_CLIENT_SECRET}),
        });

        const res = await fetch(buildOAuth2Url(serverUrl, "token"), {
            method: "POST",
            headers: {"Content-Type": "application/x-www-form-urlencoded"},
            body: body.toString(),
        });

        if (!res.ok) {
            grafanaClient.error("Token refresh failed", {route: "POST /v2/oauth2/token (refresh)", status: res.status});
            return null;
        }

        const data = await res.json() as OAuth2TokenResponse;
        if (!data.access_token || !data.refresh_token) {
            grafanaClient.error("Unexpected token refresh response", {payload: data});
            return null;
        }

        return data;
    } catch (e) {
        grafanaClient.error("Token refresh error", {error: e});
        return null;
    }
}

export async function revokeToken(
    serverUrl: string,
    token: string,
    tokenTypeHint?: "access_token" | "refresh_token"
): Promise<boolean> {
    try {
        const params = new URLSearchParams({token});
        if (tokenTypeHint) params.set("token_type_hint", tokenTypeHint);

        const res = await fetch(buildOAuth2Url(serverUrl, "revoke"), {
            method: "POST",
            headers: {"Content-Type": "application/x-www-form-urlencoded"},
            body: params.toString(),
        });

        return res.ok;
    } catch (e) {
        grafanaClient.error("Token revocation failed", {error: e});
        return false;
    }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

async function initiateAuthorize(serverUrl: string, codeChallenge: string): Promise<string | null> {
    try {
        const params = new URLSearchParams({
            response_type: "code",
            client_id: OAUTH2_CLIENT_ID,
            redirect_uri: OAUTH2_REDIRECT_URI,
            code_challenge: codeChallenge,
            code_challenge_method: "S256",
        });

        const res = await fetch(buildOAuth2Url(serverUrl, "authorize") + "?" + params.toString(), {
            redirect: "manual",
            headers: { Origin: OAUTH2_ORIGIN },
        });

        if (res.status !== 302) {
            grafanaClient.error("Authorize initiation failed", {route: "GET /v2/oauth2/authorize", status: res.status});
            return null;
        }

        const location = res.headers.get("Location");
        if (!location) return null;

        const requestId = new URL(location).searchParams.get("request_id");
        if (!requestId) {
            console.error("No request_id in authorize redirect:", location);
            return null;
        }

        return requestId;
    } catch (e) {
        grafanaClient.error("Authorize initiation error", {error: e});
        return null;
    }
}

interface SubmitAuthorizeResult {
    mfaRequired: boolean;
    mfaToken?: string;
    code?: string;
}

async function submitAuthorize(
    serverUrl: string,
    requestId: string,
    username: string,
    password: string
): Promise<SubmitAuthorizeResult | null> {
    try {
        const body = new URLSearchParams({request_id: requestId, username, password});

        const res : Response = await fetch(buildOAuth2Url(serverUrl, "authorize"), {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Origin": OAUTH2_ORIGIN,
            },
            body: body.toString(),
            redirect: "manual",
        });

        console.log("Authorize response status : " + res.status);

        if (res.status === 302) {
            const location = res.headers.get("Location");
            if (!location) return null;

            const redirectUrl = new URL(location);
            const error = redirectUrl.searchParams.get("error");
            if (error) {
                grafanaClient.error("Authorization error", {error, errorDescription: redirectUrl.searchParams.get("error_description")});
                return null;
            }

            const code = redirectUrl.searchParams.get("code");
            if (code) return {mfaRequired: false, code};

            return null;
        }

        if (res.status === 200) {
            const data = await res.json() as MfaRequiredResponse;
            if (data.mfa_required && data.mfa_token) {
                return {mfaRequired: true, mfaToken: data.mfa_token};
            }
            return null;
        }

        grafanaClient.error("Authorize submit failed", {route: "POST /v2/oauth2/authorize", status: res.status});
        return null;
    } catch (e) {
        grafanaClient.error("Authorize submit error", {error: e});
        return null;
    }
}

async function submitMfa(serverUrl: string, mfaToken: string, totpCode: string): Promise<string | null> {
    try {
        const body = new URLSearchParams({mfa_token: mfaToken, totp_code: totpCode});

        const res = await fetch(buildOAuth2Url(serverUrl, "authorize/mfa"), {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Origin": OAUTH2_ORIGIN,
            },
            body: body.toString(),
            redirect: "manual",
        });

        if (res.status === 401) {
            // Wrong TOTP code — token is NOT consumed, caller can retry
            return null;
        }

        if (res.status !== 302) {
            grafanaClient.error("MFA submit failed", {route: "POST /v2/oauth2/authorize/mfa", status: res.status});
            return null;
        }

        const location = res.headers.get("Location");
        if (!location) return null;

        const code = new URL(location).searchParams.get("code");
        if (!code) return null;

        return code;
    } catch (e) {
        grafanaClient.error("MFA submit error", {error: e});
        return null;
    }
}

async function exchangeCodeForTokens(serverUrl: string, code: string, codeVerifier: string): Promise<OAuth2TokenResponse | null> {
    try {
        const body = new URLSearchParams({
            grant_type: "authorization_code",
            code,
            code_verifier: codeVerifier,
            client_id: OAUTH2_CLIENT_ID,
            redirect_uri: OAUTH2_REDIRECT_URI,
            ...(OAUTH2_CLIENT_SECRET && {client_secret: OAUTH2_CLIENT_SECRET}),
        });

        const res = await fetch(buildOAuth2Url(serverUrl, "token"), {
            method: "POST",
            headers: {"Content-Type": "application/x-www-form-urlencoded"},
            body: body.toString(),
        });

        if (!res.ok) {
            grafanaClient.error("Token exchange failed", {route: "POST /v2/oauth2/token", status: res.status, body: await res.text()});
            return null;
        }

        const data = await res.json() as OAuth2TokenResponse;
        if (!data.access_token || !data.refresh_token) {
            grafanaClient.error("Unexpected token response", {payload: data});
            return null;
        }

        return data;
    } catch (e) {
        grafanaClient.error("Token exchange error", {error: e});
        return null;
    }
}

async function fetchUserInfo(serverUrl: string, accessToken: string): Promise<UserInfo | null> {
    try {
        const res = await fetch(new URL("v2/oauth2/userinfo", serverUrl).toString(), {
            headers: {Authorization: `Bearer ${accessToken}`},
        });

        if (!res.ok) {
            grafanaClient.error("Fetch user info failed", {route: "GET /v2/oauth2/userinfo", status: res.status});
            return null;
        }

        const data: unknown = await res.json();
        console.log("[fetchUserInfo] raw payload:", JSON.stringify(data));
        if (!isUserInfo(data)) {
            grafanaClient.error("Unexpected user info payload", {payload: data});
            console.error("[fetchUserInfo] schema validation failed for payload:", JSON.stringify(data));
            return null;
        }

        return mapToUserInfo(data);
    } catch (e) {
        grafanaClient.error("Fetch user info error", {error: e});
        return null;
    }
}

// ---------------------------------------------------------------------------
// URL builder
// ---------------------------------------------------------------------------

function buildOAuth2Url(serverUrl: string, path: string): string {
    return new URL(`v2/oauth2/${path}`, serverUrl).toString();
}
