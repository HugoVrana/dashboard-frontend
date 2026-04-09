"use client"

import {buildAuthApiUrl, getDashboardAuthLocalUrl, getDashboardAuthRenderUrl} from "@/app/auth/dashboardAuthApiContext";
import GrafanaClient from "@/app/shared/dataAccess/grafanaClient";
import {RoleReadSchema, type RoleRead} from "@/app/auth/models/role/roleRead";
import {apiFetch} from "@/app/shared/lib/apiFetch";

const grafanaClient = new GrafanaClient();

function resolveUrl(isLocal: boolean): string {
    return isLocal ? getDashboardAuthLocalUrl() : getDashboardAuthRenderUrl();
}

export async function getRolesClient(isLocal: boolean, authToken: string): Promise<RoleRead[] | null> {
    const url = buildAuthApiUrl(resolveUrl(isLocal), "role/");

    try {
        const res = await apiFetch(url.toString(), {
            headers: {Authorization: `Bearer ${authToken}`},
        });

        if (!res.ok) {
            grafanaClient.error("API error", {route: "GET /api/v2/role/", status: res.status});
            return null;
        }

        const data = await res.json();
        const parsed = RoleReadSchema.array().safeParse(data);
        if (!parsed.success) {
            grafanaClient.error("Unexpected payload", {route: "GET /api/v2/role/", error: parsed.error});
            return null;
        }

        return parsed.data;
    } catch (error) {
        grafanaClient.error("Request failed", {route: "GET /api/v2/role/", error});
        return null;
    }
}
