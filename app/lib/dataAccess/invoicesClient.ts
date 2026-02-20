"use client"

import {InvoiceRead} from "@/app/models/invoice/invoiceRead";
import {
    isInvoiceRead,
    mapToInvoiceRead,
    mapToInvoiceReadPage
} from "@/app/typeValidators/invoiceValidator";
import {PageRequest} from "@/app/models/page/pageRequest";
import {PageResponse} from "@/app/models/page/pageResponse";
import {isPage} from "@/app/typeValidators/pageResponseValidator";
import GrafanaClient from "@/app/lib/dataAccess/grafanaClient";
import {getDashboardLocalUrl, getDashboardRenderUrl} from "@/app/lib/devOverlay/dashboardApiContext";

const grafanaClient : GrafanaClient = new GrafanaClient();

export async function getInvoiceAmount(isLocal: boolean, authToken: string, status?: string) : Promise<number | null> {
    let baseUrl : string = isLocal ? getDashboardLocalUrl() : getDashboardRenderUrl();
    let u : URL = new URL("/invoices/amount", baseUrl);

    if (status && status.trim() !== "") {
        u.searchParams.set("status", status.trim())
    }

    try {
        console.log("Fetching invoice amount from", u.toString());
        const res : Response = await fetch(u.toString(), {
            headers: {
                Accept: "application/json",
                Authorization : `Bearer ${authToken}`
            }
        });

        if (!res.ok) {
            grafanaClient.error("HTTP error", {route: "GET /invoices/amount", status: res.status, statusText: res.statusText});
            console.error("HTTP error", res.status, res.statusText);
            return null;
        }

        // Return null if no invoices returned
        const text : string = await res.text();
        if (!text || text.trim() === '') {
            grafanaClient.error("Empty response body, returning empty page", {route: "GET /invoices/amount"});
            console.log("Empty response body, returning empty page");
            return null;
        }

        const data : unknown = await JSON.parse(text);
        if (typeof data === "number" && Number.isFinite(data)){
            grafanaClient.info("Fetched invoice amount", {route: "GET /invoices/amount", amount: data});
            return data;
        }
        grafanaClient.error("Unexpected payload:", {route: "GET /invoices/amount", payload: data});
        console.error("Unexpected payload:", data);
        return null;
    } catch (e) {
        grafanaClient.error("Fetch failed", {route: "GET /invoices/amount", error: e});
        console.error("Error processing response:", e);
        return null;
    }
}

export async function getInvoiceCount(isLocal : boolean, authToken: string, status : string) : Promise<number | null> {
    let baseUrl : string = isLocal ? getDashboardLocalUrl() : getDashboardRenderUrl();
    let u : URL = new URL("/invoices/count", baseUrl);

    if (status && status.trim() !== "") u.searchParams.set("status", status.trim());
    try {
        const res : Response = await fetch(u.toString(), {
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${authToken}`
            }
        });

        if (!res.ok) {
            grafanaClient.error("HTTP error", {route: "GET /invoices/count", status: res.status, statusText: res.statusText});
            console.error("HTTP error", res.status, res.statusText);
            return null;
        }

        // Return null if no data returned
        const text : string = await res.text();
        if (!text || text.trim() === '') {
            grafanaClient.error("Empty response body, returning empty page", {route: "GET /invoices/count"});
            console.log("Empty response body, returning empty page");
            return null;
        }

        const data : unknown = await JSON.parse(text);
        if (typeof data === "number" && Number.isFinite(data)){
            grafanaClient.info("Fetched invoice count", {route: "GET /invoices/count", count: data});
            return data;
        }

        grafanaClient.error("Unexpected payload:", {route: "GET /invoices/count", payload: data});
        console.error("Unexpected payload:", data);
        return null;
    } catch (e) {
        grafanaClient.error("Fetch failed", {route: "GET /invoices/count", error: e});
        console.error("Error processing response:", e);
        return null;
    }
}

export async function getLatestInvoices(isLocal : boolean, authToken: string): Promise<InvoiceRead[] | null> {
    let baseUrl : string = isLocal ? getDashboardLocalUrl() : getDashboardRenderUrl();
    let u : URL = new URL("/invoices/latest", baseUrl);
    try {
        const res : Response = await fetch(u.toString(), {
            headers: {
                Accept: "application/json",
                Authorization : `Bearer ${authToken}`
            }
        });

        if (!res.ok) {
            grafanaClient.error("HTTP error", {route: "GET /invoices/latest", status: res.status, statusText: res.statusText});
            console.error("HTTP error", res.status, res.statusText);
            return null;
        }

        // Return null if no data returned
        const text : string = await res.text();
        if (!text || text.trim() === '') {
            grafanaClient.error("Empty response body, returning empty page", {route: "GET /invoices/latest"});
            console.log("Empty response body, returning empty page");
            return null;
        }

        const data : unknown = await JSON.parse(text);
        if (Array.isArray(data)) {
            grafanaClient.info("Fetched latest invoices", {route: "GET /invoices/latest", count: data.length});
            return data
                .map(mapToInvoiceRead)
                .filter(isInvoiceRead) as InvoiceRead[];
        } else {
            grafanaClient.error("Unexpected payload:", {route: "GET /invoices/latest", payload: data});
            console.error("Unexpected payload:", data);
            return null;
        }
    } catch (e) {
        grafanaClient.error("Fetch failed", {route: "GET /invoices/latest", error: e});
        console.error("Fetch failed:", e);
        return null;
    }
}

export async function getFilteredInvoices(isLocal : boolean, authToken: string, searchTerm: string, page : number) : Promise<PageResponse<InvoiceRead> | null> {
    console.log("[getFilteredInvoices] Starting with params:", { isLocal, searchTerm, page, hasAuthToken: !!authToken });

    let baseUrl : string = isLocal ? getDashboardLocalUrl() : getDashboardRenderUrl();
    let u : URL = new URL("/invoices/search", baseUrl);
    console.log("[getFilteredInvoices] Request URL:", u.toString());

    try {
        let pageRequest : PageRequest = {
            order: "",
            page: page,
            search: searchTerm,
            size: 15,
            sort: ""
        };
        console.log("[getFilteredInvoices] Page request body:", JSON.stringify(pageRequest));

        const res : Response = await fetch(u.toString(), {
            method: "POST",
            headers: {
                "Content-Type" : "application/json",
                Accept : "application/json",
                Authorization : `Bearer ${authToken}`
            },
            body: JSON.stringify(pageRequest)
        });
        console.log("[getFilteredInvoices] Response status:", res.status, res.statusText);

        if (!res.ok) {
            grafanaClient.error("HTTP error", {route: "POST /invoices/search", status: res.status, statusText: res.statusText});
            console.error("[getFilteredInvoices] HTTP error:", res.status, res.statusText);
            return null;
        }

        // Return null if no invoices returned
        const text : string = await res.text();
        console.log("[getFilteredInvoices] Raw response text length:", text?.length ?? 0);
        console.log("[getFilteredInvoices] Raw response text (first 500 chars):", text?.substring(0, 500));

        if (!text || text.trim() === '') {
            grafanaClient.error("Empty response body, returning empty page", {route: "POST /invoices/search"});
            console.error("[getFilteredInvoices] Empty response body");
            return null;
        }

        const data : unknown = JSON.parse(text);
        console.log("[getFilteredInvoices] Parsed data keys:", data && typeof data === 'object' ? Object.keys(data) : typeof data);

        if (!isPage(data)){
            grafanaClient.error("Unexpected payload:", {route: "POST /invoices/search", payload: data});
            console.error("[getFilteredInvoices] isPage check failed. Data:", JSON.stringify(data, null, 2));
            return null;
        }

        const result : PageResponse<InvoiceRead> | null  = mapToInvoiceReadPage(data);
        console.log("[getFilteredInvoices] mapToInvoiceReadPage result:", result ? { dataLength: result.data.length, page: result.currentPage, totalPages: result.totalPages } : null);

        if (!result) {
            grafanaClient.error("Unexpected payload:", {route: "POST /invoices/search", payload: data});
            console.error("[getFilteredInvoices] mapToInvoiceReadPage returned null");
            return null;
        }

        grafanaClient.info("Fetched filtered invoices", {
            route: "POST /invoices/search",
            body : {searchTerm : searchTerm , page : page},
            count: result.data.length
        });
        console.log("[getFilteredInvoices] Success! Result:", result);
        return result;
    } catch (e) {
        grafanaClient.error("Fetch failed", {route: "POST /invoices/search", error: e});
        console.error("[getFilteredInvoices] Catch block - error:", e);
        console.error("[getFilteredInvoices] Error stack:", e instanceof Error ? e.stack : 'No stack trace');
        return null;
    }
}

export async function getInvoice(isLocal : boolean, authToken: string, id : string) : Promise<InvoiceRead | null> {
    let baseUrl : string = isLocal ? getDashboardLocalUrl() : getDashboardRenderUrl();
    const u : URL = new URL("/invoices/" + id, baseUrl);
    try {
        const res : Response = await fetch(u.toString(), {
            method: "POST",
            headers: {
                Content_Type : "application/json",
                Accept : "application/json",
                Authorization : `Bearer ${authToken}`
            }
        });

        if (!res.ok) {
            grafanaClient.error("HTTP error", {route: "GET /invoices/" + id, status: res.status, statusText: res.statusText});
            console.error("HTTP error", res.status, res.statusText);
            return null;
        }

        // Return null if no data returned
        const text : string = await res.text();
        if (!text || text.trim() === '') {
            grafanaClient.error("Empty response body, returning empty page", {route: "GET /invoices/" + id});
            console.log("Empty response body, returning empty page");
            return null;
        }

        const data : unknown = await JSON.parse(text);
        if (!isInvoiceRead(data)) {
            grafanaClient.error("Unexpected payload:", {route: "GET /invoices/" + id, payload: data});
            console.error("Unexpected payload:", data);
            return null;
        }

        grafanaClient.info("Fetched invoice", {route: "GET /invoices/" + id, id: id});
        let result : InvoiceRead | null = mapToInvoiceRead(data);

        if (!result) {
            grafanaClient.error("Unexpected payload:", {route: "GET /invoices/id", payload: data});
            console.error("[getInvoiceById] mapToInvoiceReadPage returned null");
            return null;
        }
        return result;
    } catch (e) {
        grafanaClient.error("Fetch failed", {route: "GET /invoices/" + id, error: e});
        console.error("Fetch failed:", e);
        return null;
    }
}