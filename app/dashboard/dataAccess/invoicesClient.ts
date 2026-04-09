"use client"

import GrafanaClient from "@/app/shared/dataAccess/grafanaClient";
import {DASHBOARD_API_CONFIG} from "@/app/dashboard/dashboardApiContext";
import {mapToInvoiceRead, mapToInvoiceReadPage} from "@/app/dashboard/typeValidators/invoiceValidator";
import type {InvoiceRead} from "@/app/dashboard/models/invoiceRead";
import type {PageResponse} from "@/app/shared/models/pageResponse";
import {apiFetch} from "@/app/shared/lib/apiFetch";

const grafanaClient = new GrafanaClient();

function resolveUrl(isLocal: boolean): string {
    return isLocal ? DASHBOARD_API_CONFIG.LOCAL_URL : DASHBOARD_API_CONFIG.CLOUD_URL;
}

function buildUrl(isLocal: boolean, path: string, params?: Record<string, string>): string {
    const url = new URL(`/api/v1${path}`, resolveUrl(isLocal));

    if (params) {
        for (const [key, value] of Object.entries(params)) {
            if (value.trim()) {
                url.searchParams.set(key, value);
            }
        }
    }

    return url.toString();
}

export async function getInvoiceAmount(isLocal: boolean, authToken: string, status?: string): Promise<number | null> {
    try {
        const res = await apiFetch(
            buildUrl(isLocal, "/invoices/amount", status?.trim() ? {status: status.trim()} : undefined),
            {
                headers: {Authorization: `Bearer ${authToken}`},
            }
        );
        if (res.status !== 200) {
            grafanaClient.error("HTTP error", {route: "GET /invoices/amount", status: res.status});
            return null;
        }

        const data = await res.json();
        return typeof data === "number" ? data : null;
    } catch (e) {
        grafanaClient.error("Fetch failed", {route: "GET /invoices/amount", error: e});
        return null;
    }
}

export async function getInvoiceCount(isLocal: boolean, authToken: string, status: string): Promise<number | null> {
    try {
        const res = await apiFetch(
            buildUrl(isLocal, "/invoices/count", status.trim() ? {status: status.trim()} : undefined),
            {
                headers: {Authorization: `Bearer ${authToken}`},
            }
        );
        if (res.status !== 200) {
            grafanaClient.error("HTTP error", {route: "GET /invoices/count", status: res.status});
            return null;
        }

        const data = await res.json();
        return typeof data === "number" ? data : null;
    } catch (e) {
        grafanaClient.error("Fetch failed", {route: "GET /invoices/count", error: e});
        return null;
    }
}

export async function getLatestInvoices(isLocal: boolean, authToken: string): Promise<InvoiceRead[] | null> {
    try {
        const res = await apiFetch(buildUrl(isLocal, "/invoices/latest"), {
            headers: {Authorization: `Bearer ${authToken}`},
        });
        if (res.status !== 200) {
            grafanaClient.error("HTTP error", {route: "GET /invoices/latest", status: res.status});
            return null;
        }

        const data = await res.json();
        if (!Array.isArray(data)) {
            grafanaClient.error("Unexpected payload", {route: "GET /invoices/latest", payload: data});
            return null;
        }

        return data
            .map(mapToInvoiceRead)
            .filter((x): x is InvoiceRead => x !== null);
    } catch (e) {
        grafanaClient.error("Fetch failed", {route: "GET /invoices/latest", error: e});
        return null;
    }
}

export async function getFilteredInvoices(isLocal: boolean, authToken: string, searchTerm: string, page: number): Promise<PageResponse<InvoiceRead> | null> {
    try {
        const res = await apiFetch(buildUrl(isLocal, "/invoices/search"), {
            method: "POST",
            headers: {Authorization: `Bearer ${authToken}`},
            body: JSON.stringify({order: "", page, search: searchTerm, size: 10, sort: ""}),
        });
        if (res.status !== 200) {
            grafanaClient.error("HTTP error", {route: "POST /invoices/search", status: res.status});
            return null;
        }

        const data = await res.json();
        const result = mapToInvoiceReadPage(data);
        if (!result) {
            grafanaClient.error("Unexpected payload", {route: "POST /invoices/search", payload: data});
            return null;
        }
        return result;
    } catch (e) {
        grafanaClient.error("Fetch failed", {route: "POST /invoices/search", error: e});
        return null;
    }
}

export async function getInvoice(isLocal: boolean, authToken: string, id: string): Promise<InvoiceRead | null> {
    try {
        const res = await apiFetch(buildUrl(isLocal, `/invoices/${id}`), {
            headers: {Authorization: `Bearer ${authToken}`},
        });
        if (res.status !== 200) {
            grafanaClient.error("HTTP error", {route: `GET /invoices/${id}`, status: res.status});
            return null;
        }

        const data = await res.json();
        return mapToInvoiceRead(data);
    } catch (e) {
        grafanaClient.error("Fetch failed", {route: `GET /invoices/${id}`, error: e});
        return null;
    }
}
