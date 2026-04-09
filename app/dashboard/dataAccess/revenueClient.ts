"use client"

import GrafanaClient from "@/app/shared/dataAccess/grafanaClient";
import {DASHBOARD_API_CONFIG} from "@/app/dashboard/dashboardApiContext";
import {apiFetch} from "@/app/shared/lib/apiFetch";
import {RevenueReadSchema, type RevenueRead} from "@/app/dashboard/models/revenueRead";

const grafanaClient = new GrafanaClient();

function resolveUrl(isLocal: boolean): string {
    return isLocal ? DASHBOARD_API_CONFIG.LOCAL_URL : DASHBOARD_API_CONFIG.CLOUD_URL;
}

export async function getRevenue(isLocal: boolean, authToken: string): Promise<RevenueRead[] | null> {
    try {
        const res = await apiFetch(`${resolveUrl(isLocal)}/api/v1/revenues/`, {
            headers: {Authorization: `Bearer ${authToken}`},
        });
        if (res.status !== 200) {
            grafanaClient.error("HTTP error", {route: "GET /revenues/", status: res.status});
            return null;
        }

        const data = await res.json();
        const parsed = RevenueReadSchema.array().safeParse(data);
        if (!parsed.success) {
            grafanaClient.error("Unexpected payload", {route: "GET /revenues/", payload: data});
            return null;
        }

        return parsed.data;
    } catch (e) {
        grafanaClient.error("Fetch failed", {route: "GET /revenues/", error: e});
        return null;
    }
}
