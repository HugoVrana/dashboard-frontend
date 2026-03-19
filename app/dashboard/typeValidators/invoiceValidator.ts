import {type InvoiceRead, InvoiceReadSchema} from "@/app/dashboard/models/invoiceRead";
import {type InvoiceCreate, InvoiceCreateSchema} from "@/app/dashboard/models/invoiceCreate";
import {type InvoiceUpdate, InvoiceUpdateSchema} from "@/app/dashboard/models/invoiceUpdate";
import {createPageSchema, type PageResponse} from "@/app/shared/models/pageResponse";

// Page schema for invoices
const InvoiceReadPageSchema = createPageSchema(InvoiceReadSchema);

export function isInvoiceRead(x: unknown): x is InvoiceRead {
    return InvoiceReadSchema.safeParse(x).success;
}

export function mapToInvoiceRead(x: unknown): InvoiceRead | null {
    const result = InvoiceReadSchema.safeParse(x);
    return result.success ? result.data : null;
}

export function isInvoiceCreate(x: unknown): x is InvoiceCreate {
    return InvoiceCreateSchema.safeParse(x).success;
}

export function mapToInvoiceCreate(x: unknown): InvoiceCreate | null {
    const result = InvoiceCreateSchema.safeParse(x);
    return result.success ? result.data : null;
}

export function isInvoiceUpdate(x: unknown): x is InvoiceUpdate {
    return InvoiceUpdateSchema.safeParse(x).success;
}

export function mapToInvoiceUpdate(x: unknown): InvoiceUpdate | null {
    const result = InvoiceUpdateSchema.safeParse(x);
    return result.success ? result.data : null;
}

export function isInvoiceReadPage(x : unknown) : x is PageResponse<InvoiceRead> {
    return InvoiceReadPageSchema.safeParse(x).success;
}

export function mapToInvoiceReadPage(x: unknown): PageResponse<InvoiceRead> | null {
    const result = InvoiceReadPageSchema.safeParse(x);
    return result.success ? result.data : null;
}
