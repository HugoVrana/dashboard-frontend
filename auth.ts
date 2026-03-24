import NextAuth, {Session, User} from "next-auth";
import Credentials from "next-auth/providers/credentials";
import {RoleRead} from "@/app/auth/models/role";
import {JWT} from "next-auth/jwt";
import {loginWithOAuth2, refreshAccessToken, revokeToken} from "@/app/auth/oauth2/oauth2ServerClient";

async function authorizeUser(email: string, password: string, serverUrl: string) {
    console.log("[auth] authorizeUser called — serverUrl:", serverUrl, "email:", email);

    const result = await loginWithOAuth2(serverUrl, email, password);

    if (!result) {
        console.error("[auth] OAuth2 login returned null");
        return null;
    }

    if ("mfaRequired" in result) {
        console.log("[auth] MFA required for user:", email);
        // MFA not yet supported in the login form — fail gracefully
        return null;
    }

    console.log("[auth] OAuth2 login succeeded:", result.user?.email ?? email);

    const grantList: string[] = (result.user?.roleReads ?? []).flatMap(
        (r: { grants: { name: string }[] }) => r.grants.map((g: { name: string }) => g.name)
    );

    return {
        id: result.user?.id ?? email,
        email: result.user?.email ?? email,
        role: result.user?.roleReads ?? [],
        grants: grantList,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresIn: result.expiresIn,
        imageUrl: result.user?.profileImageUrl ?? null,
        url: serverUrl,
    };
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
        async jwt({ token, user } : {token : JWT, user : User}) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.role = user.role;
                token.accessToken = user.accessToken;
                token.refreshToken = user.refreshToken;
                token.expiresAt = Date.now() + (user.expiresIn * 1000);
                token.url = user.url;
                token.image = user.imageUrl;
            }

            // Automatic token refresh when expired
            if (token.expiresAt && Date.now() > (token.expiresAt as number)) {
                console.log("[auth] Access token expired, refreshing...");
                const refreshed = await refreshAccessToken(
                    token.url as string,
                    token.refreshToken as string
                );

                if (refreshed) {
                    token.accessToken = refreshed.access_token!;
                    token.refreshToken = refreshed.refresh_token!;
                    token.expiresAt = Date.now() + (refreshed.expires_in! * 1000);
                    console.log("[auth] Access token refreshed");
                } else {
                    console.error("[auth] Token refresh failed");
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

                if (!url || !accessToken || !refreshToken) {
                    return;
                }

                await Promise.all([
                    revokeToken(url, accessToken, "access_token"),
                    revokeToken(url, refreshToken, "refresh_token"),
                ]);
            }
        }
    }
});
