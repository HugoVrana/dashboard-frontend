"use client"

import GrafanaClient from "@/app/shared/dataAccess/grafanaClient";
import {DASHBOARD_API_CONFIG} from "@/app/dashboard/dashboardApiContext";
import {dataApiOptions} from "@/app/lib/api/dataApiFetch";
import {
    getInvoiceAmount as getInvoiceAmountApi,
    getInvoiceCount as getInvoiceCountApi,
    getLatestInvoice,
    searchInvoices,
    getInvoiceById,
} from "@/app/lib/api/data/invoices";
import {mapToInvoiceRead, mapToInvoiceReadPage} from "@/app/dashboard/typeValidators/invoiceValidator";
import type {InvoiceRead} from "@/app/dashboard/models/invoiceRead";
import type {PageResponse} from "@/app/shared/models/pageResponse";

const grafanaClient = new GrafanaClient();

function resolveUrl(isLocal: boolean): string {
    return isLocal ? DASHBOARD_API_CONFIG.LOCAL_URL : DASHBOARD_API_CONFIG.CLOUD_URL;
}

export async function getInvoiceAmount(isLocal: boolean, authToken: string, status?: string): Promise<number | null> {
    try {
        const res = await getInvoiceAmountApi(
            status?.trim() ? {status: status.trim()} : undefined,
            dataApiOptions(resolveUrl(isLocal), authToken)
        );
        if (res.status !== 200) {
            grafanaClient.error("HTTP error", {route: "GET /invoices/amount", status: res.status});
            return null;
        }
        return res.data;
    } catch (e) {
        grafanaClient.error("Fetch failed", {route: "GET /invoices/amount", error: e});
        return null;
    }
}

export async function getInvoiceCount(isLocal: boolean, authToken: string, status: string): Promise<number | null> {
    try {
        const res = await getInvoiceCountApi(
            status.trim() ? {status: status.trim()} : undefined,
            dataApiOptions(resolveUrl(isLocal), authToken)
        );
        if (res.status !== 200) {
            grafanaClient.error("HTTP error", {route: "GET /invoices/count", status: res.status});
            return null;
        }
        return res.data;
    } catch (e) {
        grafanaClient.error("Fetch failed", {route: "GET /invoices/count", error: e});
        return null;
    }
}

export async function getLatestInvoices(isLocal: boolean, authToken: string): Promise<InvoiceRead[] | null> {
    try {
        const res = await getLatestInvoice(undefined, dataApiOptions(resolveUrl(isLocal), authToken));
        if (res.status !== 200) {
            grafanaClient.error("HTTP error", {route: "GET /invoices/latest", status: res.status});
            return null;
        }
        return res.data
            .map(mapToInvoiceRead)
            .filter((x): x is InvoiceRead => x !== null);
    } catch (e) {
        grafanaClient.error("Fetch failed", {route: "GET /invoices/latest", error: e});
        return null;
    }
}

export async function getFilteredInvoices(isLocal: boolean, authToken: string, searchTerm: string, page: number): Promise<PageResponse<InvoiceRead> | null> {
    try {
        const res = await searchInvoices(
            {order: "", page, search: searchTerm, size: 10, sort: ""},
            dataApiOptions(resolveUrl(isLocal), authToken)
        );
        if (res.status !== 200) {
            grafanaClient.error("HTTP error", {route: "POST /invoices/search", status: res.status});
            return null;
        }
        const result = mapToInvoiceReadPage(res.data);
        if (!result) {
            grafanaClient.error("Unexpected payload", {route: "POST /invoices/search", payload: res.data});
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
        const res = await getInvoiceById(id, dataApiOptions(resolveUrl(isLocal), authToken));
        if (res.status !== 200) {
            grafanaClient.error("HTTP error", {route: `GET /invoices/${id}`, status: res.status});
            return null;
        }
        return mapToInvoiceRead(res.data);
    } catch (e) {
        grafanaClient.error("Fetch failed", {route: `GET /invoices/${id}`, error: e});
        return null;
    }
}
