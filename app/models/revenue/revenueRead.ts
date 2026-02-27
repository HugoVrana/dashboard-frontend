import {z} from "zod";

export const RevenueReadSchema = z.object({
    month: z.string(),
    revenue: z.number(),
});

export type RevenueRead = z.infer<typeof RevenueReadSchema>;
