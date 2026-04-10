import {z} from "zod";
import {UserInfoSchema} from "@/app/auth/models/user/userInfo";

export const RegisterResponseSchema = z.object({
    user: UserInfoSchema,
    requiresTwoFactorEnrollment: z.boolean(),
    nextStep: z.string().nullable().optional(),
});

export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;
