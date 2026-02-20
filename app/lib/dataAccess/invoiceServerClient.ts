import GrafanaServerClient from "@/app/lib/dataAccess/grafanaServerClient";
import {InvoiceCreate} from "@/app/models/invoice/invoiceCreate";
import {InvoiceRead} from "@/app/models/invoice/invoiceRead";
import {getAuthToken} from "@/app/lib/permission/permissionsServerClient";
import {isInvoiceRead, mapToInvoiceRead} from "@/app/lib/typeValidators/invoiceValidator";
import {InvoiceUpdate} from "@/app/models/invoice/invoiceUpdate";
import {create} from "node:domain";

const grafanaClient : GrafanaServerClient = new GrafanaServerClient();

export async function postInvoice(serverUrl : string, invoice : InvoiceCreate): Promise<InvoiceRead | null> {
    try {
        const url = new URL("/invoices", serverUrl);

        const res : Response = await fetch(url.toString(), {
            method: "POST",
            body: JSON.stringify(invoice),
            headers: {
                "Content-Type": "application/json",
                Authorization : `Bearer ${await getAuthToken()}`,
            }
        });

        if (!res.ok) {
            console.error("API error:", res.status, res.statusText);
            grafanaClient.error("API error", {route: "POST /invoices", status: res.status, statusText: res.statusText});
            return null;
        }

        const text : string = await res.text();
        if (!text || text.trim() === '') {
            grafanaClient.error("Empty response body, returning empty page", {route: "POST /invoices"});
            console.log("Empty response body, returning empty page");
            return null;
        }

        const data : unknown = JSON.parse(text);
        if (!isInvoiceRead(data)) {
            grafanaClient.error("Unexpected payload:", {route: "POST /invoices", payload: data});
            console.error("Unexpected payload:", data);
            return null;
        }

        const createdInvoice : InvoiceRead | null = mapToInvoiceRead(data);
        if (!createdInvoice) {
            grafanaClient.error("Unexpected payload:", {route: "POST /invoices", payload: data});
            console.error("Unexpected payload:", data);
            return null;
        }
        return createdInvoice;

    } catch (e) {
        console.error("Post failed:", e);
        grafanaClient.error("Post failed", {route: "POST /invoices", error: e});
        return null;
    }
}

export async function putInvoice(serverUrl : string, invoice : InvoiceUpdate): Promise<InvoiceRead | null> {
    try {
        const url = new URL("/invoices/" + invoice.invoice_id, serverUrl);
        const res : Response = await fetch(url.toString(), {
            method: "PUT",
            body: JSON.stringify(invoice),
            headers: {
                "Content-Type": "application/json",
                Authorization : `Bearer ${await getAuthToken()}`
            }
        });

        if (!res.ok) {
            console.error("API error:", res.status, res.statusText);
            grafanaClient.error("API error", {route: "PUT /invoices", status: res.status, statusText: res.statusText});
            return null;
        }

        const text : string = await res.text();
        if (!text || text.trim() === '') {
            grafanaClient.error("Empty response body, returning empty page", {route: "PUT /invoices"});
            console.log("Empty response body, returning empty page");
            return null;
        }

        const data : unknown = JSON.parse(text);
        if (!isInvoiceRead(data)) {
            grafanaClient.error("Unexpected payload:", {route: "PUT /invoices", payload: data});
            console.error("Unexpected payload:", data);
            return null;
        }

        const updatedInvoice : InvoiceRead | null = mapToInvoiceRead(data);
        if (!updatedInvoice) {
            grafanaClient.error("Unexpected payload:", {route: "PUT /invoices", payload: data});
            console.error("Unexpected payload:", data);
        }

        console.log("Updated invoice:", updatedInvoice);
        grafanaClient.info("Updated invoice", {route: "PUT /invoices", invoice: updatedInvoice});
        return updatedInvoice;
    } catch (e) {
        console.error("Post failed:", e);
        grafanaClient.error("Post failed", {route: "PUT /invoices", error: e});
        return null;
    }
}

export async function deleteInvoice(serverUrl : string, id : string) : Promise<number> {
    try {
        const url = new URL("/invoices/" + id, serverUrl);

        const res : Response = await fetch(url.toString(), {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization : `Bearer ${await getAuthToken()}`
            }
        });

        if (!res.ok) {
            console.error("API error:", res.status, res.statusText);
            grafanaClient.error("API error", {route: "DELETE /invoices", status: res.status, statusText: res.statusText});
            return 0;
        }

        console.log("Deleted invoice:", id);
        grafanaClient.info("Deleted invoice", {route: "DELETE /invoices", id: id});
        return 1;
    } catch (e) {
        console.error("Delete failed:", e);
        grafanaClient.error("Delete failed", {route: "DELETE /invoices", error: e});
        return 0;
    }
}