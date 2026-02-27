import {z} from "zod";
import {type CustomerRead, CustomerReadSchema} from "@/app/models/customer/customerRead";

export function isCustomerRead(x: unknown): x is CustomerRead {
    return CustomerReadSchema.safeParse(x).success;
}

export function mapToCustomerRead(x: unknown): CustomerRead | null {
    const result = CustomerReadSchema.safeParse(x);
    return result.success ? result.data : null;
}

export function isCustomerReadList(x: unknown): x is CustomerRead[] {
    return z.array(CustomerReadSchema).safeParse(x).success;
}
