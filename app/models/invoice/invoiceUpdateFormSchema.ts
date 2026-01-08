import {z} from "zod";

export const InvoiceUpdateFormSchema = z.object({
    invoice_id : z.string({
        invalid_type_error: 'Please define an invoice ID.',
    }),
    customer_id: z.string({
        invalid_type_error: 'Please select a customer.',
    }),
    amount: z.coerce
        .number()
        .gt(0, { message: 'Please enter an amount greater than $0.'
    }),
    status: z.enum(['pending', 'paid'], {
        invalid_type_error: 'Please select an invoice status.',
    })
});