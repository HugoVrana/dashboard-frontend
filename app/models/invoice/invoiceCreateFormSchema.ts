import { z } from "zod";
import { InvoiceStatusSchema } from "./invoiceStatus";

// Form schema with coercion and validation messages
export const InvoiceCreateFormSchema = z.object({
    customer_id: z.string({
        invalid_type_error: 'Please select a customer.',
    }),
    amount: z.coerce
        .number()
        .gt(0, {
            message: 'Please enter an amount greater than $0.'
        }),
    status: InvoiceStatusSchema,
});
