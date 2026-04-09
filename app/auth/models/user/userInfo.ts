import {z} from "zod";
import {RoleReadSchema} from "@/app/auth/models/role/roleRead";

export const UserInfoSchema = z.object({
    id: z.string(),
    email: z.string(),
    profileImageUrl: z.string().nullable().optional(),
    roleReads: z.array(RoleReadSchema).optional().default([]),
});

export type UserInfo = z.infer<typeof UserInfoSchema>;
