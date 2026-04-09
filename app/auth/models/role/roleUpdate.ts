import {z} from "zod";

export const RoleUpdateSchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name must not exceed 100 characters"),
});

export type RoleUpdate = z.infer<typeof RoleUpdateSchema>;
