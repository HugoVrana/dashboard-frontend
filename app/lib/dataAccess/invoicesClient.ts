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
            return Promise.resolve(null);
        }

        // Return null if no invoices returned
        const text : string = await res.text();
        if (!text || text.trim() === '') {
            grafanaClient.error("Empty response body, returning empty page", {route: "GET /invoices/amount"});
            console.log("Empty response body, returning empty page");
            return Promise.resolve(null);
        }

        const data : unknown = await JSON.parse(text);
        if (typeof data === "number" && Number.isFinite(data)){
            grafanaClient.info("Fetched invoice amount", {route: "GET /invoices/amount", amount: data});
            return Promise.resolve(data);
        }
        return null;
    } catch (e) {
        grafanaClient.error("Fetch failed", {route: "GET /invoices/amount", error: e});
        console.error("Error processing response:", e);
        return Promise.resolve(null);
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
            return Promise.resolve(null);
        }

        // Return null if no data returned
        const text : string = await res.text();
        if (!text || text.trim() === '') {
            grafanaClient.error("Empty response body, returning empty page", {route: "GET /invoices/count"});
            console.log("Empty response body, returning empty page");
            return Promise.resolve(null);
        }

        const data : unknown = await JSON.parse(text);
        if (typeof data === "number" && Number.isFinite(data)){
            grafanaClient.info("Fetched invoice count", {route: "GET /invoices/count", count: data});
            return Promise.resolve(data);
        }

        grafanaClient.error("Unexpected payload:", {route: "GET /invoices/count", payload: data});
        console.error("Unexpected payload:", data);
        return Promise.resolve(null);
    } catch (e) {
        grafanaClient.error("Fetch failed", {route: "GET /invoices/count", error: e});
        console.error("Error processing response:", e);
        return Promise.resolve(null);
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
            return Promise.resolve(null);
        }

        // Return null if no data returned
        const text : string = await res.text();
        if (!text || text.trim() === '') {
            grafanaClient.error("Empty response body, returning empty page", {route: "GET /invoices/latest"});
            console.log("Empty response body, returning empty page");
            return Promise.resolve(null);
        }

        const data : unknown = await JSON.parse(text);
        if (Array.isArray(data)) {
            grafanaClient.info("Fetched latest invoices", {route: "GET /invoices/latest", count: data.length});
            return Promise.resolve(data
                .map(mapToInvoiceRead)
                .filter(isInvoiceRead) as InvoiceRead[]);
        } else {
            grafanaClient.error("Unexpected payload:", {route: "GET /invoices/latest", payload: data});
            console.error("Unexpected payload:", data);
            return Promise.resolve(null);
        }
    } catch (e) {
        grafanaClient.error("Fetch failed", {route: "GET /invoices/latest", error: e});
        console.error("Fetch failed:", e);
        return Promise.resolve(null);
    }
}

export async function getFilteredInvoices(isLocal : boolean, authToken: string, searchTerm: string, page : number) : Promise<PageResponse<InvoiceRead> | null> {
    let baseUrl : string = isLocal ? getDashboardLocalUrl() : getDashboardRenderUrl();
    let u : URL = new URL("/invoices/search", baseUrl);
    try {
        let pageRequest : PageRequest = {
            order: "",
            page: page,
            search: searchTerm,
            size: 15,
            sort: ""
        };

        const res : Response = await fetch(u.toString(), {
            method: "POST",
            headers: {
                "Content-Type" : "application/json",
                Accept : "application/json",
                Authorization : `Bearer ${authToken}`
            },
            body: JSON.stringify(pageRequest)
        });

        if (!res.ok) {
            grafanaClient.error("HTTP error", {route: "GET /invoices/search", status: res.status, statusText: res.statusText});
            console.error("HTTP error", res.status, res.statusText);
            return Promise.resolve(null);
        }

        // Return null if no invoices returned
        const text : string = await res.text();
        if (!text || text.trim() === '') {
            grafanaClient.error("Empty response body, returning empty page", {route: "GET /invoices/search"});
            console.log("Empty response body, returning empty page");
            return Promise.resolve(null);
        }

        const data : unknown = await JSON.parse(text);
        if (!isPage(data)){
            grafanaClient.error("Unexpected payload:", {route: "GET /invoices/search", payload: data});
            console.error("Unexpected payload:", data);
            return Promise.resolve(null);
        }

        const result : PageResponse<InvoiceRead> | null  = mapToInvoiceReadPage(data);
        if (!result) {
            grafanaClient.error("Unexpected payload:", {route: "GET /invoices/search", payload: data});
            console.error("Unexpected payload:", data);
            return Promise.resolve(null);
        }
        grafanaClient.info("Fetched filtered invoices", {
            route: "GET /invoices/latest",
            body : {searchTerm : searchTerm , page : page},
            count: result.data.length
        });
        console.log("Result:", result);
        return Promise.resolve(result);
    } catch (e) {
        grafanaClient.info("Fetch failed", {route: "GET /invoices/search", error: e});
        console.log("Fetch failed:", e);
        return Promise.resolve(null);
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
            return Promise.resolve(null);
        }

        // Return null if no data returned
        const text : string = await res.text();
        if (!text || text.trim() === '') {
            grafanaClient.error("Empty response body, returning empty page", {route: "GET /invoices/" + id});
            console.log("Empty response body, returning empty page");
            return Promise.resolve(null);
        }

        const data : unknown = await JSON.parse(text);
        if (!isInvoiceRead(data)) {
            grafanaClient.error("Unexpected payload:", {route: "GET /invoices/" + id, payload: data});
            console.error("Unexpected payload:", data);
            return Promise.resolve(null);
        }

        grafanaClient.info("Fetched invoice", {route: "GET /invoices/" + id, id: id});
        let result : InvoiceRead | null = mapToInvoiceRead(data);
        return Promise.resolve(result);
    } catch (e) {
        grafanaClient.error("Fetch failed", {route: "GET /invoices/" + id, error: e});
        console.error("Fetch failed:", e);
        return Promise.resolve(null);
    }
}