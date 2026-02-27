import {z} from "zod";

// Transform to lowercase before validating (handles "PENDING", "Pending", "pending")
export const InvoiceStatusSchema = z
    .string()
    .transform(val => val.toLowerCase())
    .pipe(z.enum(["pending", "paid"], {
        invalid_type_error: 'Please select an invoice status.',
    }));

export type InvoiceStatus = z.infer<typeof InvoiceStatusSchema>;
