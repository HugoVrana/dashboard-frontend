import {z} from "zod";

export const CustomerReadSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email().optional(),
    image_url: z.string().optional(),
});

export type CustomerRead = z.infer<typeof CustomerReadSchema>;
