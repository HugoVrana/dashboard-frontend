import {z} from "zod";

export const RoleGrantRequestSchema = z.object({
    grantId: z.string().min(1, "Grant ID is required"),
    roleId: z.string().min(1, "Role ID is required"),
});

export type RoleGrantRequest = z.infer<typeof RoleGrantRequestSchema>;
