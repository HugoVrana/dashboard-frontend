"use client"

import {getDashboardLocalUrl, getDashboardRenderUrl} from "@/app/lib/devOverlay/dashboardApiContext";
import {RevenueRead} from "@/app/models/revenue/revenueRead";
import GrafanaClient from "@/app/lib/dataAccess/grafanaClient";
import {isRevenue} from "@/app/typeValidators/revenueValidator";

const grafanaClient : GrafanaClient = new GrafanaClient();

export async function getRevenue(isLocal: boolean, authToken : string) : Promise<RevenueRead[] | null> {
    let baseUrl : string = isLocal ? getDashboardLocalUrl() : getDashboardRenderUrl();
    const u = new URL("/revenues/", baseUrl);
    try {
        const res : Response = await fetch(u.toString(), {
            headers: {
                Accept: "application/json",
                Authorization : `Bearer ${authToken}`
            },
        });

        if (!res.ok) {
            grafanaClient.error("HTTP error", {route: "GET /revenues/", status: res.status, statusText: res.statusText});
            console.error("HTTP error", res.status, res.statusText);
        }

        // Return null if no data returned
        const text : string = await res.text();
        if (!text || text.trim() === '') {
            grafanaClient.error("Empty response body, returning empty page", {route: "GET /revenues/"});
            console.log("Empty response body, returning empty page");
            return Promise.resolve(null);
        }

        const data : unknown = await JSON.parse(text);
        if (!Array.isArray(data)) {
            grafanaClient.error("Unexpected payload:", {route: "GET /revenues/", payload: data});
            console.error("Expected an array, got:", data);
            return Promise.resolve(null);
        }
        grafanaClient.info("Fetched revenues", {route: "GET /revenues/"});
        return Promise.resolve(data.filter(isRevenue) as RevenueRead[]);// Wait for the Promise to resolve
    } catch (e) {
        grafanaClient.error("Fetch failed", {route: "GET /revenues/", error: e});
        console.error("Error processing response:", e);
        return Promise.resolve(null);
    }
}