import {CustomerRead} from "@/app/models/customer/customerRead";

export function mapToCustomerRead(x : unknown) : CustomerRead | null {
    if (!isCustomerRead(x)) {
        return null;
    }
    return {
        id: x.id,
        name: x.name,
        email: x.email,
        image_url: x.image_url,
    };
}

export function isCustomerRead(x : unknown) : x is CustomerRead {
    if (!x || typeof x !== "object") return false;
    const o = x as Record<string, unknown>;
    return typeof o.id === "string" &&
        typeof o.name === "string" &&
        (o.email === undefined || typeof o.email === "string") &&
        (o.image_url === undefined || typeof o.image_url === "string");
}

export function isCustomerReadList(x : unknown) : x is CustomerRead[] {
    return Array.isArray(x) && x.every(isCustomerRead);
}