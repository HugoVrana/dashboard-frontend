"use client"

import GrafanaClient from "@/app/shared/dataAccess/grafanaClient";
import {DASHBOARD_API_CONFIG} from "@/app/dashboard/dashboardApiContext";
import {dataApiOptions} from "@/app/lib/api/dataApiFetch";
import {
    getAllCustomers,
    getCustomerCount as getCustomerCountApi,
} from "@/app/lib/api/data/customers";
import type {CustomerRead} from "@/app/dashboard/models/customerRead";

const grafanaClient = new GrafanaClient();

function resolveUrl(isLocal: boolean): string {
    return isLocal ? DASHBOARD_API_CONFIG.LOCAL_URL : DASHBOARD_API_CONFIG.CLOUD_URL;
}

export async function getCustomers(isLocal: boolean, authToken: string): Promise<CustomerRead[] | null> {
    try {
        const res = await getAllCustomers(dataApiOptions(resolveUrl(isLocal), authToken));
        if (res.status !== 200) {
            grafanaClient.error("HTTP error", {route: "GET /customers/", status: res.status});
            return null;
        }
        return res.data as CustomerRead[];
    } catch (e) {
        grafanaClient.error("Fetch failed", {route: "GET /customers/", error: e});
        return null;
    }
}

export async function getCustomerCount(isLocal: boolean, authToken: string): Promise<number | null> {
    try {
        const res = await getCustomerCountApi(dataApiOptions(resolveUrl(isLocal), authToken));
        if (res.status !== 200) {
            grafanaClient.error("HTTP error", {route: "GET /customers/count", status: res.status});
            return null;
        }
        return res.data;
    } catch (e) {
        grafanaClient.error("Fetch failed", {route: "GET /customers/count", error: e});
        return null;
    }
}
