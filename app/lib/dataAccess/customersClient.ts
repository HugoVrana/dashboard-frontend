"use client"

import GrafanaClient from "@/app/lib/dataAccess/grafanaClient";
import {CustomerRead} from "@/app/models/customer/customerRead";
import {getDashboardLocalUrl, getDashboardRenderUrl} from "@/app/lib/devOverlay/dashboardApiContext";
import {isCustomerRead, isCustomerReadList} from "@/app/typeValidators/customerValidator";

const grafanaClient : GrafanaClient = new GrafanaClient();

export async function getCustomers(isLocal : boolean, authToken: string) : Promise<CustomerRead[] | null> {
    grafanaClient.info("Fetching customers", {route: "GET /customers/"});
    const baseUrl : string = isLocal ? getDashboardLocalUrl() : getDashboardRenderUrl();
    const u : URL = new URL("/customers/", baseUrl);
    try {
        const res : Response = await fetch(u.toString(), {
            headers: {
                Accept: "application/json",
                Authorization : `Bearer ${authToken}`
            }
        });

        if (!res.ok) {
            grafanaClient.error("HTTP error", {route: "GET /customers/", status: res.status, statusText: res.statusText});
            console.error("HTTP error", res.status, res.statusText);
            return null;
        }

        // Return null if no invoices returned
        const text : string = await res.text();
        if (!text || text.trim() === '') {
            grafanaClient.error("Empty response body, returning empty page", {route: "GET /customers/"});
            console.log("Empty response body, returning empty page");
            return null;
        }

        const data : unknown = JSON.parse(text);

        if (!isCustomerReadList(data)) {
            grafanaClient.error("Unexpected payload:", {route: "GET /customers/", payload: data});
            console.error("Unexpected payload:", data);
            return null;
        }

        grafanaClient.info("Fetched customers", {route: "GET /customers/"});

        return data.filter(isCustomerRead) as CustomerRead[];
    } catch (e) {
        grafanaClient.error("Fetch failed", {route: "GET /customers/", error: e});
        console.error("Fetch failed:", e);
        return null;
    }
}

export async function getCustomerCount(isLocal : boolean, authToken: string) : Promise<number | null> {
    grafanaClient.info("Fetching customer count", {route: "GET /customers/count"});
    const baseUrl : string = isLocal ? getDashboardLocalUrl() : getDashboardRenderUrl();
    const u : URL = new URL("/customers/count", baseUrl);
    try {
        const res : Response = await fetch(u.toString(), {
            headers: {
                Accept: "application/json",
                Authorization : `Bearer ${authToken}`
            }
        });

        if (!res.ok) {
            grafanaClient.error("HTTP error", {route: "GET /customers/count", status: res.status, statusText: res.statusText});
            console.error("HTTP error", res.status, res.statusText);
            return null;
        }

        // Return null if no data returned
        const text : string = await res.text();
        if (!text || text.trim() === '') {
            grafanaClient.error("Empty response body, returning empty page", {route: "GET /customers/count"});
            console.log("Empty response body, returning empty page");
            return null;
        }

        const data : unknown = JSON.parse(text);
        if (typeof data === "number" && Number.isFinite(data)) {
            grafanaClient.info("Fetched customer count", {route: "GET /customers/count", count: data});
            return data;
        }

        grafanaClient.error("Unexpected payload:", {route: "GET /customers/count", payload: data});
        console.error("Unexpected payload:", data);
        return null;
    } catch (e) {
        grafanaClient.error("Fetch failed", {route: "GET /customers/count", error: e});
        console.error("Fetch failed:", e);
        return null;
    }
}