import { z } from "zod";
import {InvoiceStatusSchema} from "@/app/models/invoice/invoiceStatus";

// Form schema with coercion and validation messages
export const InvoiceUpdateFormSchema = z.object({
    id: z.string({
        invalid_type_error: 'Please define an invoice ID.',
    }),
    customerId: z.string({
        invalid_type_error: 'Please select a customer.',
    }),
    amount: z.coerce
        .number()
        .gt(0, {
            message: 'Please enter an amount greater than $0.'
        }),
    status: InvoiceStatusSchema
});