import { z } from "zod";

export const InvoiceStatusSchema = z.enum(["pending", "paid"], {
    invalid_type_error: 'Please select an invoice status.',
});

export type InvoiceStatus = z.infer<typeof InvoiceStatusSchema>;