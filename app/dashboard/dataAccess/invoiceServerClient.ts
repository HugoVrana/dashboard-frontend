import GrafanaServerClient from "@/app/shared/dataAccess/grafanaServerClient";
import {getAuthToken} from "@/app/auth/permission/permissionsServerClient";
import {mapToInvoiceRead} from "@/app/dashboard/typeValidators/invoiceValidator";
import type {InvoiceRead} from "@/app/dashboard/models/invoiceRead";
import type {InvoiceCreate} from "@/app/dashboard/models/invoiceCreate";
import type {InvoiceUpdate} from "@/app/dashboard/models/invoiceUpdate";

const grafanaClient = new GrafanaServerClient();

function buildHeaders(authToken: string): HeadersInit {
    return {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
    };
}

export async function postInvoice(serverUrl: string, invoice: InvoiceCreate): Promise<InvoiceRead | null> {
    try {
        const res = await fetch(`${serverUrl}/api/v1/invoices`, {
            method: "POST",
            headers: buildHeaders(await getAuthToken()),
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
            headers: buildHeaders(await getAuthToken()),
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
            headers: buildHeaders(await getAuthToken()),
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
