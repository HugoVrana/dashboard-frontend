import {buildAuthApiUrl} from "@/app/auth/dashboardAuthApiContext";
import GrafanaServerClient from "@/app/shared/dataAccess/grafanaServerClient";
import {RoleRead, RoleReadSchema} from "@/app/auth/models/role/roleRead";
import {CreateRole} from "@/app/auth/models/role/createRole";
import {RoleUpdate} from "@/app/auth/models/role/roleUpdate";
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

export async function createRole(serverUrl: string, accessToken: string, body: CreateRole): Promise<RoleRead | null> {
    try {
        const url = buildAuthApiUrl(serverUrl, "role/");
        const res = await fetch(url.toString(), {
            method: "POST",
            headers: await buildHeaders(accessToken),
            body: JSON.stringify(body),
        });
        if (!res.ok) {
            grafanaClient.error("API error", { route: "POST /api/v2/role/", status: res.status });
            return null;
        }
        const data = await res.json();
        const parsed = RoleReadSchema.safeParse(data);
        if (!parsed.success) {
            grafanaClient.error("Unexpected payload", { route: "POST /api/v2/role/", error: parsed.error });
            return null;
        }
        return parsed.data;
    } catch (e) {
        grafanaClient.error("Request failed", { route: "POST /api/v2/role/", error: e });
        return null;
    }
}

export async function updateRole(serverUrl: string, accessToken: string, id: string, body: RoleUpdate): Promise<RoleRead | null> {
    try {
        const url = buildAuthApiUrl(serverUrl, `role/${id}`);
        const res = await fetch(url.toString(), {
            method: "PUT",
            headers: await buildHeaders(accessToken),
            body: JSON.stringify(body),
        });
        if (!res.ok) {
            grafanaClient.error("API error", { route: `PUT /api/v2/role/${id}`, status: res.status });
            return null;
        }
        const data = await res.json();
        const parsed = RoleReadSchema.safeParse(data);
        if (!parsed.success) {
            grafanaClient.error("Unexpected payload", { route: `PUT /api/v2/role/${id}`, error: parsed.error });
            return null;
        }
        return parsed.data;
    } catch (e) {
        grafanaClient.error("Request failed", { route: `PUT /api/v2/role/${id}`, error: e });
        return null;
    }
}

export async function deleteRole(serverUrl: string, accessToken: string, id: string): Promise<boolean> {
    try {
        const url = buildAuthApiUrl(serverUrl, `role/${id}`);
        const res = await fetch(url.toString(), {
            method: "DELETE",
            headers: await buildHeaders(accessToken),
        });
        if (!res.ok) {
            grafanaClient.error("API error", { route: `DELETE /api/v2/role/${id}`, status: res.status });
            return false;
        }
        return true;
    } catch (e) {
        grafanaClient.error("Request failed", { route: `DELETE /api/v2/role/${id}`, error: e });
        return false;
    }
}

export async function addGrantToRole(serverUrl: string, accessToken: string, roleId: string, grantId: string): Promise<RoleRead | null> {
    try {
        const url = buildAuthApiUrl(serverUrl, `role/${roleId}/grants/${grantId}`);
        const res = await fetch(url.toString(), {
            method: "POST",
            headers: await buildHeaders(accessToken),
        });
        if (!res.ok) {
            grafanaClient.error("API error", { route: `POST /api/v2/role/${roleId}/grants/${grantId}`, status: res.status });
            return null;
        }
        const data = await res.json();
        const parsed = RoleReadSchema.safeParse(data);
        if (!parsed.success) {
            grafanaClient.error("Unexpected payload", { route: `POST /api/v2/role/${roleId}/grants/${grantId}`, error: parsed.error });
            return null;
        }
        return parsed.data;
    } catch (e) {
        grafanaClient.error("Request failed", { route: `POST /api/v2/role/${roleId}/grants/${grantId}`, error: e });
        return null;
    }
}

export async function removeGrantFromRole(serverUrl: string, accessToken: string, roleId: string, grantId: string): Promise<RoleRead | null> {
    try {
        const url = buildAuthApiUrl(serverUrl, `role/${roleId}/grants/${grantId}`);
        const res = await fetch(url.toString(), {
            method: "DELETE",
            headers: await buildHeaders(accessToken),
        });
        if (!res.ok) {
            grafanaClient.error("API error", { route: `DELETE /api/v2/role/${roleId}/grants/${grantId}`, status: res.status });
            return null;
        }
        const data = await res.json();
        const parsed = RoleReadSchema.safeParse(data);
        if (!parsed.success) {
            grafanaClient.error("Unexpected payload", { route: `DELETE /api/v2/role/${roleId}/grants/${grantId}`, error: parsed.error });
            return null;
        }
        return parsed.data;
    } catch (e) {
        grafanaClient.error("Request failed", { route: `DELETE /api/v2/role/${roleId}/grants/${grantId}`, error: e });
        return null;
    }
}
