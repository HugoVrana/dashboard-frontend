import {z} from "zod";

export const CreateRoleSchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name must not exceed 100 characters"),
});

export type CreateRole = z.infer<typeof CreateRoleSchema>;
