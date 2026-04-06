"use client"

import {buildAuthApiUrl, getDashboardAuthLocalUrl, getDashboardAuthRenderUrl} from "@/app/auth/dashboardAuthApiContext";
import GrafanaClient from "@/app/shared/dataAccess/grafanaClient";
import {GrantReadSchema, type GrantRead} from "@/app/auth/models/grant/grantRead";

const grafanaClient = new GrafanaClient();

function resolveUrl(isLocal: boolean): string {
    return isLocal ? getDashboardAuthLocalUrl() : getDashboardAuthRenderUrl();
}

function buildHeaders(authToken: string): HeadersInit {
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
    };
}

export async function getGrantsClient(isLocal: boolean, authToken: string): Promise<GrantRead[] | null> {
    const url = buildAuthApiUrl(resolveUrl(isLocal), "grant/");

    try {
        const res = await fetch(url.toString(), {
            headers: buildHeaders(authToken),
        });

        if (!res.ok) {
            grafanaClient.error("API error", {route: "GET /api/v2/grant/", status: res.status});
            return null;
        }

        const data = await res.json();
        const parsed = GrantReadSchema.array().safeParse(data);
        if (!parsed.success) {
            grafanaClient.error("Unexpected payload", {route: "GET /api/v2/grant/", error: parsed.error});
            return null;
        }

        return parsed.data;
    } catch (error) {
        grafanaClient.error("Request failed", {route: "GET /api/v2/grant/", error});
        return null;
    }
}
