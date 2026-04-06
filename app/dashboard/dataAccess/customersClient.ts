"use client"

import GrafanaClient from "@/app/shared/dataAccess/grafanaClient";
import {DASHBOARD_API_CONFIG} from "@/app/dashboard/dashboardApiContext";
import type {CustomerRead} from "@/app/dashboard/models/customerRead";
import {CustomerReadSchema} from "@/app/dashboard/models/customerRead";

const grafanaClient = new GrafanaClient();

function resolveUrl(isLocal: boolean): string {
    return isLocal ? DASHBOARD_API_CONFIG.LOCAL_URL : DASHBOARD_API_CONFIG.CLOUD_URL;
}

function buildHeaders(authToken: string): HeadersInit {
    return {
        Authorization: `Bearer ${authToken}`,
    };
}

export async function getCustomers(isLocal: boolean, authToken: string): Promise<CustomerRead[] | null> {
    try {
        const res = await fetch(`${resolveUrl(isLocal)}/api/v1/customers/`, {
            headers: buildHeaders(authToken),
        });
        if (res.status !== 200) {
            grafanaClient.error("HTTP error", {route: "GET /customers/", status: res.status});
            return null;
        }

        const data = await res.json();
        const parsed = CustomerReadSchema.array().safeParse(data);
        if (!parsed.success) {
            grafanaClient.error("Unexpected payload", {route: "GET /customers/", payload: data});
            return null;
        }

        return parsed.data;
    } catch (e) {
        grafanaClient.error("Fetch failed", {route: "GET /customers/", error: e});
        return null;
    }
}

export async function getCustomerCount(isLocal: boolean, authToken: string): Promise<number | null> {
    try {
        const res = await fetch(`${resolveUrl(isLocal)}/api/v1/customers/count`, {
            headers: buildHeaders(authToken),
        });
        if (res.status !== 200) {
            grafanaClient.error("HTTP error", {route: "GET /customers/count", status: res.status});
            return null;
        }

        const data = await res.json();
        return typeof data === "number" ? data : null;
    } catch (e) {
        grafanaClient.error("Fetch failed", {route: "GET /customers/count", error: e});
        return null;
    }
}
