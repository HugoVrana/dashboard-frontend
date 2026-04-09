import {z} from "zod";
import {RoleReadSchema} from "@/app/auth/models/role/roleRead";

export const UserAdminReadSchema = z.object({
    id: z.string().optional(),
    email: z.string().optional(),
    emailVerified: z.boolean().optional(),
    emailVerifiedAt: z.string().datetime().nullable().optional(),
    locked: z.boolean().optional(),
    failedLoginAttempts: z.number().int().optional(),
    profileImageUrl: z.string().nullable().optional(),
    roles: z.array(RoleReadSchema).optional().default([]),
    createdAt: z.string().datetime().nullable().optional(),
    deletedAt: z.string().datetime().nullable().optional(),
});

export type UserAdminRead = z.infer<typeof UserAdminReadSchema>;
