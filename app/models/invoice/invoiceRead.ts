import {z} from "zod";
import {CustomerReadSchema} from "../customer/customerRead";
import {InvoiceStatusSchema} from "./invoiceStatus";

export const InvoiceReadSchema = z.object({
    id: z.union([z.string(), z.number()]).transform(String),
    customer: CustomerReadSchema,
    amount: z.number().positive(),
    status: InvoiceStatusSchema,
    date: z.string().transform(d => new Date(d)),
});

export type InvoiceRead = z.infer<typeof InvoiceReadSchema>;
