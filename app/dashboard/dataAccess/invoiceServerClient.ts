import GrafanaServerClient from "@/app/shared/dataAccess/grafanaServerClient";
import {getAuthToken} from "@/app/auth/permission/permissionsServerClient";
import {dataApiOptions} from "@/app/lib/api/dataApiFetch";
import {
    createInvoice,
    updateInvoice,
    deleteInvoice as deleteInvoiceApi,
} from "@/app/lib/api/data/invoices";
import {mapToInvoiceRead} from "@/app/dashboard/typeValidators/invoiceValidator";
import type {InvoiceRead} from "@/app/dashboard/models/invoiceRead";
import type {InvoiceCreate} from "@/app/dashboard/models/invoiceCreate";
import type {InvoiceUpdate} from "@/app/dashboard/models/invoiceUpdate";

const grafanaClient = new GrafanaServerClient();

export async function postInvoice(serverUrl: string, invoice: InvoiceCreate): Promise<InvoiceRead | null> {
    try {
        const res = await createInvoice(invoice, dataApiOptions(serverUrl, await getAuthToken()));
        if (res.status !== 200) {
            grafanaClient.error("API error", {route: "POST /invoices", status: res.status});
            return null;
        }
        return mapToInvoiceRead(res.data);
    } catch (e) {
        grafanaClient.error("Post failed", {route: "POST /invoices", error: e});
        return null;
    }
}

export async function putInvoice(serverUrl: string, invoice: InvoiceUpdate): Promise<InvoiceRead | null> {
    try {
        const res = await updateInvoice(invoice.id, invoice, dataApiOptions(serverUrl, await getAuthToken()));
        if (res.status !== 200) {
            grafanaClient.error("API error", {route: "PUT /invoices", status: res.status});
            return null;
        }
        return mapToInvoiceRead(res.data);
    } catch (e) {
        grafanaClient.error("Post failed", {route: "PUT /invoices", error: e});
        return null;
    }
}

export async function deleteInvoice(serverUrl: string, id: string): Promise<number> {
    try {
        const res = await deleteInvoiceApi(id, dataApiOptions(serverUrl, await getAuthToken()));
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
