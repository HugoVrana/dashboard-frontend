"use client"

import {RevenueRead} from "@/app/dashboard/models/revenueRead";
import GrafanaClient from "@/app/shared/dataAccess/grafanaClient";
import {buildDataApiUrl} from "@/app/dashboard/dashboardApiContext";
import {isRevenue} from "@/app/dashboard/typeValidators/revenueValidator";

const grafanaClient : GrafanaClient = new GrafanaClient();

export async function getRevenue(isLocal: boolean, authToken : string) : Promise<RevenueRead[] | null> {
    console.log("fetching revenue");
    const u = buildDataApiUrl(isLocal, "/revenues/");
    try {
        const res : Response = await fetch(u.toString(), {
            headers: {
                Accept: "application/json",
                Authorization : `Bearer ${authToken}`
            },
        });

        console.log("res", res);

        if (!res.ok) {
            grafanaClient.error("HTTP error", {route: "GET /revenues/", status: res.status, statusText: res.statusText});
            console.error("HTTP error", res.status, res.statusText);
            return null;
        }

        // Return null if no data returned
        const text : string = await res.text();
        if (!text || text.trim() === '') {
            grafanaClient.error("Empty response body, returning empty page", {route: "GET /revenues/"});
            console.log("Empty response body, returning empty page");
            return null;
        }

        const data : unknown = await JSON.parse(text);
        if (!Array.isArray(data)) {
            grafanaClient.error("Unexpected payload:", {route: "GET /revenues/", payload: data});
            console.error("Expected an array, got:", data);
            return null;
        }
        grafanaClient.info("Fetched revenues", {route: "GET /revenues/"});
        return data.filter(isRevenue);

    } catch (e) {
        grafanaClient.error("Fetch failed", {route: "GET /revenues/", error: e});
        console.error("Error processing response:", e);
        return null;
    }
}