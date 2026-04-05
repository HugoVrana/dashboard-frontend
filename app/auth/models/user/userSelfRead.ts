import {z} from "zod";

export const UserSelfReadSchema = z.object({
    id: z.string().optional(),
    email: z.string().optional(),
    emailVerified: z.boolean().optional(),
    emailVerifiedAt: z.string().datetime().nullable().optional(),
    profileImageUrl: z.string().nullable().optional(),
    locked: z.boolean().optional(),
});

export type UserSelfRead = z.infer<typeof UserSelfReadSchema>;
