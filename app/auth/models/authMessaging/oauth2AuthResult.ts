import {z} from "zod";
import {UserInfoSchema} from "@/app/auth/models/user/userInfo";

export const Oauth2AuthResultSchema = z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    expiresIn: z.number(),
    user: UserInfoSchema.nullable(),
});

export type Oauth2AuthResult = z.infer<typeof Oauth2AuthResultSchema>;
