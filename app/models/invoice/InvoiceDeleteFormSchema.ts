import {z} from "zod";

export const InvoiceDeleteFormSchema = z.object({
    invoiceId : z.string({
        invalid_type_error: 'Please define an invoice ID.',
    })
});