import {z} from "zod";

export const EnsureGrantsResponseSchema = z.object({
    created: z.array(z.string()),
    alreadyExisted: z.array(z.string()),
});

export type EnsureGrantsResponse = z.infer<typeof EnsureGrantsResponseSchema>;