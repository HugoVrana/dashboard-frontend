import {PageResponse} from "@/app/models/page/pageResponse";

export function isPage(x: unknown) : x is PageResponse<any> {
    if (!x || typeof x !== "object") return false;
    const o = x as Record<string, unknown>;
    return(
        typeof o.totalPages === "number" &&
        typeof o.currentPage === "number" &&
        typeof o.itemsPerPage === "number" &&
        Array.isArray(o.data)
    )
}