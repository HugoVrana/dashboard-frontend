import GrafanaServerClient from "@/app/shared/dataAccess/grafanaServerClient";
import {getAuthToken} from "@/app/auth/permission/permissionsServerClient";
import {mapToInvoiceRead} from "@/app/dashboard/typeValidators/invoiceValidator";
import type {InvoiceRead} from "@/app/dashboard/models/invoiceRead";
import type {InvoiceCreate} from "@/app/dashboard/models/invoiceCreate";
import type {InvoiceUpdate} from "@/app/dashboard/models/invoiceUpdate";
import {getXsrfToken} from "@/app/shared/lib/xsrfToken";

const grafanaClient = new GrafanaServerClient();

async function buildHeaders(authToken: string): Promise<HeadersInit> {
    const xsrfToken = await getXsrfToken();
    return {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
        ...(xsrfToken && {"X-XSRF-TOKEN": xsrfToken}),
    };
}

export async function postInvoice(serverUrl: string, invoice: InvoiceCreate): Promise<InvoiceRead | null> {
    try {
        const res = await fetch(`${serverUrl}/api/v1/invoices`, {
            method: "POST",
            headers: await buildHeaders(await getAuthToken()),
            body: JSON.stringify(invoice),
        });
        if (res.status !== 200) {
            grafanaClient.error("API error", {route: "POST /invoices", status: res.status});
            return null;
        }

        const data = await res.json();
        return mapToInvoiceRead(data);
    } catch (e) {
        grafanaClient.error("Post failed", {route: "POST /invoices", error: e});
        return null;
    }
}

export async function putInvoice(serverUrl: string, invoice: InvoiceUpdate): Promise<InvoiceRead | null> {
    try {
        const res = await fetch(`${serverUrl}/api/v1/invoices/${invoice.id}`, {
            method: "PUT",
            headers: await buildHeaders(await getAuthToken()),
            body: JSON.stringify(invoice),
        });
        if (res.status !== 200) {
            grafanaClient.error("API error", {route: "PUT /invoices", status: res.status});
            return null;
        }

        const data = await res.json();
        return mapToInvoiceRead(data);
    } catch (e) {
        grafanaClient.error("Post failed", {route: "PUT /invoices", error: e});
        return null;
    }
}

export async function deleteInvoice(serverUrl: string, id: string): Promise<number> {
    try {
        const res = await fetch(`${serverUrl}/api/v1/invoices/${id}`, {
            method: "DELETE",
            headers: await buildHeaders(await getAuthToken()),
        });
        if (res.status !== 200) {
            grafanaClient.error("API error", {route: "DELETE /invoices", status: res.status});
            return 0;
        }
        return 1;
    } catch (e) {
        grafanaClient.error("Delete failed", {route: "DELETE /invoices", error: e});
        return 0;
    }
}
