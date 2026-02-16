import NextAuth, {User, Session} from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { LoginRequest } from "@/app/models/auth/loginRequest";
import {RoleRead} from "@/app/models/auth/role";
import {AuthResponse} from "@/app/models/auth/authResponse";
import {JWT} from "next-auth/jwt";
import {loginUserWithTokens, logoutUserWithToken} from "@/app/lib/dataAccess/usersServerClient";

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

                const loginRequest: LoginRequest = {
                    email: credentials.email.toString(),
                    password: credentials.password.toString()
                };

                const res : AuthResponse | null = await loginUserWithTokens(credentials.url.toString(), loginRequest);

                if (!res || !res.user) {
                    return null;
                }

                console.log("User authorized:", res);

                const grantList: string[] = res.user.roleReads.flatMap(r => r.grants.map(g => g.name));

                return {
                    id: res.user.id,
                    email: res.user.email,
                    role: res.user.roleReads,
                    grants: grantList,
                    accessToken: res.accessToken,
                    refreshToken: res.refreshToken,
                    expiresIn: res.expiresIn,
                    imageUrl : res.user.profileImageUrl,
                    url: credentials.url.toString()
                };
            },
        })
    ],
    callbacks: {
        async redirect({ url, baseUrl }) {
            // Allows relative callback URLs
            if (url.startsWith("/")) return `${baseUrl}${url}`;
            // Allows callback URLs on the same origin
            if (new URL(url).origin === baseUrl) return url;
            return baseUrl;
        },
        async jwt({ token, user } :  {token : JWT, user : User}) {
            console.log("JWT callback - user:", user);
            console.log("JWT callback - token:", token);
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
            return token;
        },
        async session({ session, token } : {session : Session, token : any}) {
            console.log("Session callback - token:", token);
            session.user.id = token.id!.toString();
            session.user.email = token.email!;
            session.user.role = token.role as RoleRead[] || [];
            session.user.image = token.image as string | null | undefined;
            session.accessToken = token.accessToken!.toString();
            session.refreshToken = token.refreshToken!.toString();
            session.expiresAt = token.expiresAt!;
            session.url = token.url!.toString();
            console.log("Session callback - session:", session);
            return session;
        }
    },
    events: {
        async signOut(message : any) {
            console.log("SignOut event - message:", message);
            // For JWT strategy, the message contains { token }
            if ("token" in message && message.token) {
                console.log("SignOut event - token:", message.token);

                // Access your custom token properties
                const url : string | undefined = message.token.url?.toString();
                const accessToken : string | undefined = message.token.accessToken?.toString();
                const refreshToken : string | undefined = message.token.refreshToken?.toString();
                if (!url || !accessToken || !refreshToken) {
                    console.error("SignOut event - Invalid token:", message.token);
                    return;
                }
                await logoutUserWithToken(url, accessToken, refreshToken);
            }
        }
    }});