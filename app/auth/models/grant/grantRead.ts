import {z} from "zod";

export const GrantReadSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
});

export type GrantRead = z.infer<typeof GrantReadSchema>;
