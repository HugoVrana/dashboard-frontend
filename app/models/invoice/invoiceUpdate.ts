import { z } from "zod";
import {InvoiceStatusSchema} from "@/app/models/invoice/invoiceStatus";

// Schema for API requests
export const InvoiceUpdateSchema = z.object({
    invoice_id: z.string(),
    customer_id: z.string(),
    amount: z.number().positive(),
    status: InvoiceStatusSchema,
});

export type InvoiceUpdate = z.infer<typeof InvoiceUpdateSchema>;
