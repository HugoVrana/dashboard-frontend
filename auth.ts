import NextAuth, {Session, User} from "next-auth";
import Credentials from "next-auth/providers/credentials";
import {LoginRequest} from "@/app/auth/models/loginRequest";
import {RoleRead} from "@/app/auth/models/role";
import {JWT} from "next-auth/jwt";
import {loginWithOAuth2, refreshAccessToken, revokeToken} from "@/app/auth/oauth2/oauth2ServerClient";
import {loginUserWithTokens, logoutUserWithToken} from "@/app/auth/dataAccess/usersServerClient";
import {AuthResponse} from "@/app/auth/models/authResponse";

/**
 * Attempts V2 OAuth2 login, falls back to V1 direct login if V2 fails.
 * Returns a normalized user object or null.
 *
 * TODO: Remove V1 fallback and authVersion tracking once OAuth2 V2 is fully rolled out.
 */
async function authorizeUser(email: string, password: string, serverUrl: string) {

    // --- Try V2 OAuth2 Authorization Code flow with PKCE first ---
    try {
        const result = await loginWithOAuth2(serverUrl, email, password);

        if (result && "mfaRequired" in result) {
            console.log("MFA required for user (OAuth2 V2):", email);
            return null;
        }

        if (result && result.user) {
            console.log("User authorized via OAuth2 V2:", result.user.email);
            const grantList: string[] = result.user.roleReads.flatMap(
                (r: { grants: { name: string }[] }) => r.grants.map((g: { name: string }) => g.name)
            );
            return {
                id: result.user.id,
                email: result.user.email,
                role: result.user.roleReads,
                grants: grantList,
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
                expiresIn: result.expiresIn,
                imageUrl: result.user.profileImageUrl,
                url: serverUrl,
                authVersion: "v2" as const,
            };
        }
    } catch (e) {
        console.warn("OAuth2 V2 login failed, falling back to V1:", e);
    }

    // --- Fallback: V1 direct login ---
    try {
        console.log("Attempting V1 fallback login for:", email);
        const loginRequest: LoginRequest = { email, password };
        const res: AuthResponse | null = await loginUserWithTokens(serverUrl, loginRequest);

        if (!res || !res.user) {
            return null;
        }

        console.log("User authorized via V1 fallback:", res.user.email);
        const grantList: string[] = res.user.roleReads.flatMap(r => r.grants.map(g => g.name));

        return {
            id: res.user.id,
            email: res.user.email,
            role: res.user.roleReads,
            grants: grantList,
            accessToken: res.accessToken,
            refreshToken: res.refreshToken,
            expiresIn: res.expiresIn,
            imageUrl: res.user.profileImageUrl,
            url: serverUrl,
            authVersion: "v1" as const,
        };
    } catch (e) {
        console.error("V1 fallback login also failed:", e);
        return null;
    }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: '/auth/login',
    },
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                url: { label: "URL", type: "text" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password || !credentials?.url) {
                    return null;
                }

                const user = await authorizeUser(
                    credentials.email.toString(),
                    credentials.password.toString(),
                    credentials.url.toString()
                );

                if (!user) {
                    return null;
                }

                return {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    grants: user.grants,
                    accessToken: user.accessToken,
                    refreshToken: user.refreshToken,
                    expiresIn: user.expiresIn,
                    imageUrl: user.imageUrl,
                    url: user.url,
                    authVersion: user.authVersion,
                };
            },
        })
    ],
    callbacks: {
        async redirect({ url, baseUrl }) {
            if (url.startsWith("/")) return `${baseUrl}${url}`;
            if (new URL(url).origin === baseUrl) return url;
            return baseUrl;
        },
        async jwt({ token, user } :  {token : JWT, user : User}) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.role = user.role;
                token.accessToken = user.accessToken;
                token.refreshToken = user.refreshToken;
                token.expiresAt = Date.now() + (user.expiresIn * 1000);
                token.url = user.url;
                token.image = user.imageUrl;
                token.authVersion = (user as any).authVersion ?? "v1";
            }

            // Automatic token refresh when expired
            if (token.expiresAt && Date.now() > (token.expiresAt as number)) {
                if (token.authVersion === "v2") {
                    // V2: OAuth2 refresh_token grant
                    console.log("Access token expired, refreshing via OAuth2 V2...");
                    const refreshed = await refreshAccessToken(
                        token.url as string,
                        token.refreshToken as string
                    );

                    if (refreshed) {
                        token.accessToken = refreshed.access_token;
                        token.refreshToken = refreshed.refresh_token;
                        token.expiresAt = Date.now() + (refreshed.expires_in * 1000);
                        console.log("Access token refreshed via V2");
                    } else {
                        console.error("V2 token refresh failed");
                        token.error = "RefreshAccessTokenError";
                    }
                } else {
                    // V1: no built-in refresh — mark as expired
                    console.log("Access token expired (V1 session, no auto-refresh)");
                    token.error = "RefreshAccessTokenError";
                }
            }

            return token;
        },
        async session({ session, token } : {session : Session, token : any}) {
            session.user.id = token.id!.toString();
            session.user.email = token.email!;
            session.user.role = token.role as RoleRead[] || [];
            session.user.image = token.image as string | null | undefined;
            session.accessToken = token.accessToken!.toString();
            session.refreshToken = token.refreshToken!.toString();
            session.expiresAt = token.expiresAt!;
            session.url = token.url!.toString();
            return session;
        }
    },
    events: {
        async signOut(message : any) {
            if ("token" in message && message.token) {
                const url : string | undefined = message.token.url?.toString();
                const accessToken : string | undefined = message.token.accessToken?.toString();
                const refreshToken : string | undefined = message.token.refreshToken?.toString();
                const authVersion : string | undefined = message.token.authVersion?.toString();
                if (!url || !accessToken || !refreshToken) {
                    return;
                }

                if (authVersion === "v2") {
                    // V2: Revoke both tokens via OAuth2 revocation endpoint (RFC 7009)
                    await Promise.all([
                        revokeToken(url, accessToken, "access_token"),
                        revokeToken(url, refreshToken, "refresh_token"),
                    ]);
                } else {
                    // V1: Legacy logout endpoint
                    await logoutUserWithToken(url, accessToken, refreshToken);
                }
            }
        }
    }});