import {DefaultSession} from "@/next-auth";
import {Role} from "./role";

declare module "next-auth" {
    interface Session {
        expiresAt: number;
        user: {
            id: string;
            role: Role[];
        } & DefaultSession["user"];
        accessToken: string;
        refreshToken : string;
        url : string;
    }

    interface User {
        id: string;
        email: string;
        role: Role[];
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        url: string;
        imageUrl: string | null;
        /**
         * Which API version was used to authenticate: "v1" (legacy) or "v2" (OAuth2).
         * @deprecated Temporary field — will be removed once V1 is fully retired and all auth uses OAuth2 V2.
         */
        authVersion?: "v1" | "v2";
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: Role[];
        accessToken: string;
        refreshToken: string;
        expiresAt: number;
        image: string | null;
        /**
         * Which API version was used to authenticate: "v1" (legacy) or "v2" (OAuth2).
         * @deprecated Temporary field — will be removed once V1 is fully retired and all auth uses OAuth2 V2.
         */
        authVersion?: "v1" | "v2";
    }
}