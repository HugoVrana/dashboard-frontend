import {z} from "zod";
import {RoleReadSchema} from "./role";

export const UserInfoSchema = z.object({
    id: z.string(),
    email: z.string(),
    emailVerified: z.boolean().optional(),
    profileImageUrl: z.string().nullable().optional(),
    roleReads: z.array(RoleReadSchema).optional().default([]),
});

export type UserInfo = z.infer<typeof UserInfoSchema>;
