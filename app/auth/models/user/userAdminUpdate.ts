import {z} from "zod";

export const UserAdminUpdateSchema = z.object({
    email: z.string().email("Must be a valid email address").max(255, "Email must not exceed 255 characters").optional(),
});

export type UserAdminUpdate = z.infer<typeof UserAdminUpdateSchema>;
