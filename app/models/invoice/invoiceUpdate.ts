import {z} from "zod";
import {InvoiceStatusSchema} from "@/app/models/invoice/invoiceStatus";

// Schema for API requests
export const InvoiceUpdateSchema = z.object({
    id: z.string(),
    customerId: z.string(),
    amount: z.number().positive(),
    status: InvoiceStatusSchema,
});

export type InvoiceUpdate = z.infer<typeof InvoiceUpdateSchema>;
