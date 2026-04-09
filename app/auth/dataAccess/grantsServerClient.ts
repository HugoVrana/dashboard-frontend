import {buildAuthApiUrl} from "@/app/auth/dashboardAuthApiContext";
import GrafanaServerClient from "@/app/shared/dataAccess/grafanaServerClient";
import {GrantRead, GrantReadSchema} from "@/app/auth/models/grant/grantRead";
import {GrantCreate} from "@/app/auth/models/grant/grantCreate";
import {GrantUpdate} from "@/app/auth/models/grant/grantUpdate";
import {getXsrfToken} from "@/app/shared/lib/xsrfToken";

const grafanaClient = new GrafanaServerClient();

async function buildHeaders(accessToken: string): Promise<Record<string, string>> {
    const xsrfToken = await getXsrfToken();
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
        ...(xsrfToken && {"X-XSRF-TOKEN": xsrfToken}),
    };
}

export async function getGrants(serverUrl: string, accessToken: string): Promise<GrantRead[] | null> {
    try {
        const url = buildAuthApiUrl(serverUrl, "grant/");
        const res = await fetch(url.toString(), { headers: await buildHeaders(accessToken) });
        if (!res.ok) {
            grafanaClient.error("API error", { route: "GET /api/v2/grant/", status: res.status });
            return null;
        }
        const data = await res.json();
        const parsed = GrantReadSchema.array().safeParse(data);
        if (!parsed.success) {
            grafanaClient.error("Unexpected payload", { route: "GET /api/v2/grant/", error: parsed.error });
            return null;
        }
        return parsed.data;
    } catch (e) {
        grafanaClient.error("Request failed", { route: "GET /api/v2/grant/", error: e });
        return null;
    }
}

export async function getGrant(serverUrl: string, accessToken: string, id: string): Promise<GrantRead | null> {
    try {
        const url = buildAuthApiUrl(serverUrl, `grant/${id}`);
        const res = await fetch(url.toString(), { headers: await buildHeaders(accessToken) });
        if (!res.ok) {
            grafanaClient.error("API error", { route: `GET /api/v2/grant/${id}`, status: res.status });
            return null;
        }
        const data = await res.json();
        const parsed = GrantReadSchema.safeParse(data);
        if (!parsed.success) {
            grafanaClient.error("Unexpected payload", { route: `GET /api/v2/grant/${id}`, error: parsed.error });
            return null;
        }
        return parsed.data;
    } catch (e) {
        grafanaClient.error("Request failed", { route: `GET /api/v2/grant/${id}`, error: e });
        return null;
    }
}

export async function createGrant(serverUrl: string, accessToken: string, body: GrantCreate): Promise<GrantRead | null> {
    try {
        const url = buildAuthApiUrl(serverUrl, "grant/");
        const res = await fetch(url.toString(), {
            method: "POST",
            headers: await buildHeaders(accessToken),
            body: JSON.stringify(body),
        });
        if (!res.ok) {
            grafanaClient.error("API error", { route: "POST /api/v2/grant/", status: res.status });
            return null;
        }
        const data = await res.json();
        const parsed = GrantReadSchema.safeParse(data);
        if (!parsed.success) {
            grafanaClient.error("Unexpected payload", { route: "POST /api/v2/grant/", error: parsed.error });
            return null;
        }
        return parsed.data;
    } catch (e) {
        grafanaClient.error("Request failed", { route: "POST /api/v2/grant/", error: e });
        return null;
    }
}

export async function updateGrant(serverUrl: string, accessToken: string, id: string, body: GrantUpdate): Promise<GrantRead | null> {
    try {
        const url = buildAuthApiUrl(serverUrl, `grant/${id}`);
        const res = await fetch(url.toString(), {
            method: "PUT",
            headers: await buildHeaders(accessToken),
            body: JSON.stringify(body),
        });
        if (!res.ok) {
            grafanaClient.error("API error", { route: `PUT /api/v2/grant/${id}`, status: res.status });
            return null;
        }
        const data = await res.json();
        const parsed = GrantReadSchema.safeParse(data);
        if (!parsed.success) {
            grafanaClient.error("Unexpected payload", { route: `PUT /api/v2/grant/${id}`, error: parsed.error });
            return null;
        }
        return parsed.data;
    } catch (e) {
        grafanaClient.error("Request failed", { route: `PUT /api/v2/grant/${id}`, error: e });
        return null;
    }
}

export async function deleteGrant(serverUrl: string, accessToken: string, id: string): Promise<boolean> {
    try {
        const url = buildAuthApiUrl(serverUrl, `grant/${id}`);
        const res = await fetch(url.toString(), {
            method: "DELETE",
            headers: await buildHeaders(accessToken),
        });
        if (!res.ok) {
            grafanaClient.error("API error", { route: `DELETE /api/v2/grant/${id}`, status: res.status });
            return false;
        }
        return true;
    } catch (e) {
        grafanaClient.error("Request failed", { route: `DELETE /api/v2/grant/${id}`, error: e });
        return false;
    }
}
