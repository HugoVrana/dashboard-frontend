export type InvoiceUpdate = {
    invoice_id: string;
    amount: number;
    status : 'pending' | 'paid';
    customer_id: string;
}