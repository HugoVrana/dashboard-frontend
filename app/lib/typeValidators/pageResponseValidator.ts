import {z} from "zod";
import {type PageResponse} from "@/app/models/page/pageResponse";

// Base page schema for validation
const PageResponseSchema = z.object({
    totalPages: z.number(),
    currentPage: z.number(),
    itemsPerPage: z.number(),
    data: z.array(z.unknown()),
});

export function isPage(x: unknown): x is PageResponse<unknown> {
    return PageResponseSchema.safeParse(x).success;
}
