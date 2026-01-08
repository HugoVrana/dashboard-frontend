export type InvoiceCreate = {
    status : 'pending' | 'paid';
    amount: number;
    customer_id: string;
}