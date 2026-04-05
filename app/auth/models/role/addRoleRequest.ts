import {z} from "zod";

export const AddRoleRequestSchema = z.object({
    userId: z.string().min(1, "User ID is required"),
    roleId: z.string().min(1, "Role ID is required"),
});

export type AddRoleRequest = z.infer<typeof AddRoleRequestSchema>;
