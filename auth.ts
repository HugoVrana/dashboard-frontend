import NextAuth, {Session, User} from "next-auth";
import Credentials from "next-auth/providers/credentials";
import {RoleRead} from "@/app/auth/models/role";
import {JWT} from "next-auth/jwt";
import {refreshAccessToken, revokeToken} from "@/app/auth/oauth2/oauth2ServerClient";
import {mapToUserInfo} from "@/app/auth/typeValidators/userInfoValidator";

export const { handlers, auth, signIn, signOut } = NextAuth({
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: '/auth/login',
    },
    providers: [
        Credentials({
            id: "mfa",
            credentials: {
                accessToken: { type: "text" },
                refreshToken: { type: "text" },
                expiresIn: { type: "text" },
                userInfoJson: { type: "text" },
                url: { type: "text" },
            },
            async authorize(credentials) {
                if (!credentials?.accessToken || !credentials?.refreshToken || !credentials?.expiresIn || !credentials?.userInfoJson || !credentials?.url) {
                    return null;
                }

                try {
                    const parsed = JSON.parse(credentials.userInfoJson as string);
                    const user = mapToUserInfo(parsed);
                    const expiresIn = parseInt(credentials.expiresIn as string);

                    const grantList: string[] = (user?.roleReads ?? []).flatMap(
                        (r: { grants: { name: string }[] }) => r.grants.map((g: { name: string }) => g.name)
                    );

                    return {
                        id: user?.id ?? (credentials.accessToken as string),
                        email: user?.email ?? "",
                        role: user?.roleReads ?? [],
                        grants: grantList,
                        accessToken: credentials.accessToken as string,
                        refreshToken: credentials.refreshToken as string,
                        expiresIn,
                        imageUrl: user?.profileImageUrl ?? null,
                        url: credentials.url as string,
                    };
                } catch {
                    return null;
                }
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
                token.grants = user.grants;
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
            session.user.grants = token.grants || [];
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
