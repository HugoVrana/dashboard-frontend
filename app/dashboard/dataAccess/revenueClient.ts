"use client"

import GrafanaClient from "@/app/shared/dataAccess/grafanaClient";
import {DASHBOARD_API_CONFIG} from "@/app/dashboard/dashboardApiContext";
import {dataApiOptions} from "@/app/lib/api/dataApiFetch";
import {getAllRevenues} from "@/app/lib/api/data/revenues";
import type {RevenueRead} from "@/app/dashboard/models/revenueRead";

const grafanaClient = new GrafanaClient();

function resolveUrl(isLocal: boolean): string {
    return isLocal ? DASHBOARD_API_CONFIG.LOCAL_URL : DASHBOARD_API_CONFIG.CLOUD_URL;
}

export async function getRevenue(isLocal: boolean, authToken: string): Promise<RevenueRead[] | null> {
    try {
        const res = await getAllRevenues(dataApiOptions(resolveUrl(isLocal), authToken));
        if (res.status !== 200) {
            grafanaClient.error("HTTP error", {route: "GET /revenues/", status: res.status});
            return null;
        }
        return res.data as RevenueRead[];
    } catch (e) {
        grafanaClient.error("Fetch failed", {route: "GET /revenues/", error: e});
        return null;
    }
}
