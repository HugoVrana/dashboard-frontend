import { z } from "zod";
import { InvoiceStatusSchema } from "./invoiceStatus";

export const InvoiceCreateSchema = z.object({
    customer_id: z.string(),
    amount: z.number().positive(),
    status: InvoiceStatusSchema,
});

export type InvoiceCreate = z.infer<typeof InvoiceCreateSchema>;
