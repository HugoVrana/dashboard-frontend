import {z} from "zod";

export const GrantUpdateSchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name must not exceed 100 characters"),
    description: z.string().max(255, "Description must not exceed 255 characters").optional(),
});

export type GrantUpdate = z.infer<typeof GrantUpdateSchema>;
