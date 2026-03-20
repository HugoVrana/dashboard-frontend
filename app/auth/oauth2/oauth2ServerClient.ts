import {generateCodeChallenge, generateCodeVerifier} from "@/app/auth/oauth2/pkce";
import {OAuth2TokenResponse, OAuth2TokenResponseSchema} from "@/app/auth/oauth2/oauth2TokenResponse";
import {MfaRequiredResponseSchema} from "@/app/auth/oauth2/oauth2ErrorResponse";
import {UserInfo} from "@/app/auth/models/userInfo";
import {isUserInfo, mapToUserInfo} from "@/app/auth/typeValidators/userInfoValidator";
import {buildAuthApiUrl} from "@/app/auth/dashboardAuthApiContext";
import GrafanaServerClient from "@/app/shared/dataAccess/grafanaServerClient";

const grafanaClient: GrafanaServerClient = new GrafanaServerClient();

const OAUTH2_CLIENT_ID = process.env.OAUTH2_CLIENT_ID ?? "dashboard-frontend";
const OAUTH2_REDIRECT_URI = process.env.OAUTH2_REDIRECT_URI ?? "http://localhost:3000/api/auth/callback/credentials";

/**
 * Result of the full OAuth2 Authorization Code flow with PKCE.
 * Contains standard OAuth2 tokens plus user information.
 */
export interface OAuth2AuthResult {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: UserInfo | null;
}

/**
 * Result when MFA is required during the authorization flow.
 */
export interface OAuth2MfaRequired {
    mfaRequired: true;
    mfaToken: string;
    /** PKCE code verifier needed to complete the flow after MFA */
    codeVerifier: string;
    /** Authorization server URL (needed to continue the flow) */
    serverUrl: string;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Performs the full OAuth2 Authorization Code flow with PKCE.
 *
 * Flow:
 * 1. Generate PKCE code_verifier + code_challenge (S256)
 * 2. POST /v2/oauth2/authorize with credentials → get auth code (or MFA required)
 * 3. POST /v2/oauth2/token with code + code_verifier → get tokens
 * 4. GET /api/v1/auth/me with access_token → get user info
 *
 * Note: Step 1 of the standard flow (GET /v2/oauth2/authorize) is called first
 * to create the AuthorizationRequest and obtain a request_id. Then credentials
 * are submitted against that request_id.
 */
export async function loginWithOAuth2(
    serverUrl: string,
    email: string,
    password: string
): Promise<OAuth2AuthResult | OAuth2MfaRequired | null> {

    // 1. Generate PKCE pair
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    // 2. Initiate authorization request (GET /v2/oauth2/authorize)
    const requestId = await initiateAuthorize(serverUrl, codeChallenge);
    if (!requestId) {
        return null;
    }

    // 3. Submit credentials (POST /v2/oauth2/authorize)
    const submitResult = await submitAuthorize(serverUrl, requestId, email, password);
    if (!submitResult) {
        return null;
    }

    // 3a. Handle MFA required
    if (submitResult.mfaRequired) {
        return {
            mfaRequired: true,
            mfaToken: submitResult.mfaToken!,
            codeVerifier,
            serverUrl,
        };
    }

    // 4. Exchange authorization code for tokens
    const authCode = submitResult.code!;
    const tokens = await exchangeCodeForTokens(serverUrl, authCode, codeVerifier);
    if (!tokens) {
        return null;
    }

    // 5. Fetch user info using the access token
    const user = await fetchUserInfo(serverUrl, tokens.access_token);

    return {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresIn: tokens.expires_in,
        user,
    };
}

/**
 * Completes the OAuth2 flow after MFA verification.
 */
export async function completeMfaLogin(
    serverUrl: string,
    mfaToken: string,
    totpCode: string,
    codeVerifier: string
): Promise<OAuth2AuthResult | null> {

    // 1. Submit MFA (POST /v2/oauth2/authorize/mfa) → get auth code via redirect
    const authCode = await submitMfa(serverUrl, mfaToken, totpCode);
    if (!authCode) {
        return null;
    }

    // 2. Exchange authorization code for tokens
    const tokens = await exchangeCodeForTokens(serverUrl, authCode, codeVerifier);
    if (!tokens) {
        return null;
    }

    // 3. Fetch user info
    const user = await fetchUserInfo(serverUrl, tokens.access_token);

    return {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresIn: tokens.expires_in,
        user,
    };
}

/**
 * Refreshes an access token using a refresh token.
 * POST /v2/oauth2/token with grant_type=refresh_token.
 */
export async function refreshAccessToken(
    serverUrl: string,
    refreshToken: string
): Promise<OAuth2TokenResponse | null> {
    try {
        const url = buildOAuth2Url(serverUrl, "token");

        const body = new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: refreshToken,
        });

        const res = await fetch(url, {
            method: "POST",
            headers: {"Content-Type": "application/x-www-form-urlencoded"},
            body: body.toString(),
        });

        if (!res.ok) {
            console.error("Token refresh failed:", res.status, res.statusText);
            grafanaClient.error("Token refresh failed", {
                route: "POST /v2/oauth2/token (refresh)",
                status: res.status,
            });
            return null;
        }

        const data: unknown = await res.json();
        const parsed = OAuth2TokenResponseSchema.safeParse(data);
        if (!parsed.success) {
            console.error("Unexpected token refresh response:", data);
            grafanaClient.error("Unexpected token refresh response", {payload: data});
            return null;
        }

        return parsed.data;
    } catch (e) {
        console.error("Token refresh error:", e);
        grafanaClient.error("Token refresh error", {error: e});
        return null;
    }
}

/**
 * Revokes a token (access or refresh).
 * POST /v2/oauth2/revoke (RFC 7009).
 */
export async function revokeToken(
    serverUrl: string,
    token: string,
    tokenTypeHint?: "access_token" | "refresh_token"
): Promise<boolean> {
    try {
        const url = buildOAuth2Url(serverUrl, "revoke");

        const params = new URLSearchParams({token});
        if (tokenTypeHint) {
            params.set("token_type_hint", tokenTypeHint);
        }

        const res = await fetch(url, {
            method: "POST",
            headers: {"Content-Type": "application/x-www-form-urlencoded"},
            body: params.toString(),
        });

        return res.ok;
    } catch (e) {
        console.error("Token revocation failed:", e);
        grafanaClient.error("Token revocation failed", {error: e});
        return false;
    }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Step 1: Initiate the authorization request.
 * GET /v2/oauth2/authorize → follows redirect to extract request_id.
 */
async function initiateAuthorize(
    serverUrl: string,
    codeChallenge: string
): Promise<string | null> {
    try {
        const params = new URLSearchParams({
            response_type: "code",
            client_id: OAUTH2_CLIENT_ID,
            redirect_uri: OAUTH2_REDIRECT_URI,
            code_challenge: codeChallenge,
            code_challenge_method: "S256",
        });

        const url = buildOAuth2Url(serverUrl, "authorize") + "?" + params.toString();

        // Don't follow the redirect — we need the Location header to extract request_id
        const res = await fetch(url, {redirect: "manual"});

        if (res.status !== 302) {
            console.error("Authorize initiation failed:", res.status);
            grafanaClient.error("Authorize initiation failed", {
                route: "GET /v2/oauth2/authorize",
                status: res.status,
            });
            return null;
        }

        const location = res.headers.get("Location");
        if (!location) {
            console.error("No Location header in authorize response");
            return null;
        }

        // Extract request_id from the redirect URL
        // Format: {loginUrl}?request_id={id}&state={state}
        const redirectUrl = new URL(location);
        const requestId = redirectUrl.searchParams.get("request_id");
        if (!requestId) {
            console.error("No request_id in authorize redirect:", location);
            return null;
        }

        return requestId;
    } catch (e) {
        console.error("Authorize initiation error:", e);
        grafanaClient.error("Authorize initiation error", {error: e});
        return null;
    }
}

interface SubmitAuthorizeResult {
    mfaRequired: boolean;
    mfaToken?: string;
    code?: string;
}

/**
 * Step 2: Submit credentials against the authorization request.
 * POST /v2/oauth2/authorize (form-encoded).
 *
 * Returns either:
 * - An authorization code (via redirect Location header)
 * - An MFA required response (HTTP 200 JSON)
 */
async function submitAuthorize(
    serverUrl: string,
    requestId: string,
    username: string,
    password: string
): Promise<SubmitAuthorizeResult | null> {
    try {
        const url = buildOAuth2Url(serverUrl, "authorize");

        const body = new URLSearchParams({
            request_id: requestId,
            username,
            password,
        });

        // Don't follow redirect — we need to extract the auth code from Location
        const res = await fetch(url, {
            method: "POST",
            headers: {"Content-Type": "application/x-www-form-urlencoded"},
            body: body.toString(),
            redirect: "manual",
        });

        // 302 = success, auth code in redirect URI
        if (res.status === 302) {
            const location = res.headers.get("Location");
            if (!location) {
                console.error("No Location header in authorize submit response");
                return null;
            }

            const redirectUrl = new URL(location);

            // Check for error in redirect
            const error = redirectUrl.searchParams.get("error");
            if (error) {
                const errorDescription = redirectUrl.searchParams.get("error_description");
                console.error("Authorization error:", error, errorDescription);
                grafanaClient.error("Authorization error", {error, errorDescription});
                return null;
            }

            const code = redirectUrl.searchParams.get("code");
            if (!code) {
                console.error("No code in authorize redirect:", location);
                return null;
            }

            return {mfaRequired: false, code};
        }

        // 200 = MFA required
        if (res.status === 200) {
            const data: unknown = await res.json();
            const parsed = MfaRequiredResponseSchema.safeParse(data);
            if (parsed.success) {
                return {
                    mfaRequired: true,
                    mfaToken: parsed.data.mfa_token,
                };
            }
            console.error("Unexpected 200 response from authorize:", data);
            return null;
        }

        console.error("Authorize submit failed:", res.status, res.statusText);
        grafanaClient.error("Authorize submit failed", {
            route: "POST /v2/oauth2/authorize",
            status: res.status,
        });
        return null;
    } catch (e) {
        console.error("Authorize submit error:", e);
        grafanaClient.error("Authorize submit error", {error: e});
        return null;
    }
}

/**
 * Submit MFA code to complete authorization.
 * POST /v2/oauth2/authorize/mfa (form-encoded).
 * Returns the authorization code from the redirect.
 */
async function submitMfa(
    serverUrl: string,
    mfaToken: string,
    totpCode: string
): Promise<string | null> {
    try {
        const url = buildOAuth2Url(serverUrl, "authorize/mfa");

        const body = new URLSearchParams({
            mfa_token: mfaToken,
            totp_code: totpCode,
        });

        const res = await fetch(url, {
            method: "POST",
            headers: {"Content-Type": "application/x-www-form-urlencoded"},
            body: body.toString(),
            redirect: "manual",
        });

        if (res.status !== 302) {
            console.error("MFA submit failed:", res.status);
            grafanaClient.error("MFA submit failed", {
                route: "POST /v2/oauth2/authorize/mfa",
                status: res.status,
            });
            return null;
        }

        const location = res.headers.get("Location");
        if (!location) {
            console.error("No Location header in MFA response");
            return null;
        }

        const redirectUrl = new URL(location);
        const code = redirectUrl.searchParams.get("code");
        if (!code) {
            console.error("No code in MFA redirect:", location);
            return null;
        }

        return code;
    } catch (e) {
        console.error("MFA submit error:", e);
        grafanaClient.error("MFA submit error", {error: e});
        return null;
    }
}

/**
 * Exchange an authorization code for tokens.
 * POST /v2/oauth2/token with grant_type=authorization_code + PKCE.
 */
async function exchangeCodeForTokens(
    serverUrl: string,
    code: string,
    codeVerifier: string
): Promise<OAuth2TokenResponse | null> {
    try {
        const url = buildOAuth2Url(serverUrl, "token");

        const body = new URLSearchParams({
            grant_type: "authorization_code",
            code,
            code_verifier: codeVerifier,
            client_id: OAUTH2_CLIENT_ID,
            redirect_uri: OAUTH2_REDIRECT_URI,
        });

        const res = await fetch(url, {
            method: "POST",
            headers: {"Content-Type": "application/x-www-form-urlencoded"},
            body: body.toString(),
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error("Token exchange failed:", res.status, errorText);
            grafanaClient.error("Token exchange failed", {
                route: "POST /v2/oauth2/token",
                status: res.status,
                body: errorText,
            });
            return null;
        }

        const data: unknown = await res.json();
        const parsed = OAuth2TokenResponseSchema.safeParse(data);
        if (!parsed.success) {
            console.error("Unexpected token response:", data);
            grafanaClient.error("Unexpected token response", {payload: data, error: parsed.error});
            return null;
        }

        return parsed.data;
    } catch (e) {
        console.error("Token exchange error:", e);
        grafanaClient.error("Token exchange error", {error: e});
        return null;
    }
}

/**
 * Fetch user information using an access token.
 * GET /api/v1/auth/me (authenticated with Bearer token).
 */
async function fetchUserInfo(
    serverUrl: string,
    accessToken: string
): Promise<UserInfo | null> {
    try {
        const url = buildAuthApiUrl(serverUrl, "auth/me");

        const res = await fetch(url.toString(), {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!res.ok) {
            console.error("Fetch user info failed:", res.status, res.statusText);
            grafanaClient.error("Fetch user info failed", {
                route: "GET /api/v1/auth/me",
                status: res.status,
            });
            return null;
        }

        const data: unknown = await res.json();
        if (!isUserInfo(data)) {
            console.error("Unexpected user info payload:", data);
            grafanaClient.error("Unexpected user info payload", {payload: data});
            return null;
        }

        return mapToUserInfo(data);
    } catch (e) {
        console.error("Fetch user info error:", e);
        grafanaClient.error("Fetch user info error", {error: e});
        return null;
    }
}

// ---------------------------------------------------------------------------
// URL builder
// ---------------------------------------------------------------------------

/**
 * Builds a V2 OAuth2 endpoint URL.
 * Pattern: {serverUrl}/v2/oauth2/{path}
 */
function buildOAuth2Url(serverUrl: string, path: string): string {
    return new URL(`v2/oauth2/${path}`, serverUrl).toString();
}
