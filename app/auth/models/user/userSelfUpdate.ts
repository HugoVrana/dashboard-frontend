import {z} from "zod";

export const UserSelfUpdateSchema = z.object({
    email: z.string().email().optional(),
    password: z.string().optional(),
});

export type UserSelfUpdate = z.infer<typeof UserSelfUpdateSchema>;
