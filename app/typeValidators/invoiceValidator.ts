import {isCustomerRead} from "@/app/typeValidators/customerValidator";
import { isPage } from "./pageResponseValidator";
import {InvoiceRead} from "@/app/models/invoice/invoiceRead";
import {PageResponse} from "@/app/models/page/pageResponse";
import {InvoiceUpdate} from "@/app/models/invoice/invoiceUpdate";
import {InvoiceCreate} from "@/app/models/invoice/invoiceCreate";


export function mapToInvoiceRead(x: unknown): InvoiceRead | null {
    if (isInvoiceRead(x)) {
        return {
            id: String(x.id),
            customer: x.customer,
            amount: x.amount,
            status: x.status as InvoiceRead["status"],
            date: x.date,
        };
    }
    return null;
}

export function mapToInvoiceReadPage(x: unknown) : PageResponse<InvoiceRead> | null {
    if (isPage(x)) {
        // Validate and map the data array
        const mappedData: InvoiceRead[] = [];

        if (Array.isArray(x.data)) {
            for (const item of x.data) {
                const mapped : InvoiceRead | null = mapToInvoiceRead(item);
                if (mapped === null) {
                    return null; // Invalid item in array
                }
                mappedData.push(mapped);
            }
        } else {
            return null; // data is not an array
        }

        return {
            totalPages: Number(x.totalPages),
            currentPage: Number(x.currentPage),
            itemsPerPage: Number(x.itemsPerPage),
            data: mappedData,
        };
    }
    return null;
}

export function mapToInvoiceUpdate(x: unknown): InvoiceUpdate | null {
    if (isInvoiceUpdate(x)){
        return {
            invoice_id : String(x.invoice_id),
            customer_id : String(x.customer_id),
            amount : x.amount,
            status : x.status as InvoiceUpdate["status"]
        }
    }
    return null;
}

export function mapToInvoiceCreate(x: unknown): InvoiceCreate | null {
    if (isInvoiceCreate(x)){
        console.log("Creating invoice with data:", x);
        return {
            customer_id : x.customer_id,
            amount : x.amount,
            status : x.status as InvoiceCreate["status"]
        }
    }
    return null;
}

export function isInvoiceRead(x: unknown): x is InvoiceRead {
    if (!x || typeof x !== "object") return false;
    const o = x as Record<string, unknown>;
    return (
        (typeof o.id === "string" || typeof o.id === "number") &&
        isCustomerRead(o.customer) &&
        typeof o.amount === "number" &&
        typeof o.status === "string" &&
        typeof o.date === "string"
    );
}

export function isInvoiceCreate(x: unknown): x is InvoiceCreate {
    if (!x || typeof x !== "object") return false;
    const o = x as Record<string, unknown>;
    return (
        typeof o.customer_id === "string" &&
        typeof o.amount === "number" &&
        typeof o.status === "string"
    );
}

export function isInvoiceUpdate(x: unknown): x is InvoiceUpdate {
    if (!x || typeof x !== "object") return false;
    const o = x as Record<string, unknown>;
    return (
        typeof o.invoice_id === "string" &&
        typeof o.customer_id === "string" &&
        typeof o.amount === "number" &&
        typeof o.status === "string"
    );
}