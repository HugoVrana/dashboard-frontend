import {buildAuthApiUrl} from "@/app/auth/dashboardAuthApiContext";
import GrafanaServerClient from "@/app/shared/dataAccess/grafanaServerClient";

const grafanaClient: GrafanaServerClient = new GrafanaServerClient();

export type EmailVerificationResult =
    | { success: true }
    | { success: false; status: number };

export async function verifyEmail(serverUrl: string, token: string): Promise<EmailVerificationResult> {
    try {
        const url = buildAuthApiUrl(serverUrl, `auth/verify-email?token=${encodeURIComponent(token)}`);

        const res: Response = await fetch(url.toString(), {
            method: "GET",
            cache: "no-store",
        });

        if (!res.ok) {
            const responseBody = await res.text();
            grafanaClient.error("Email verification failed", {
                route: "GET /api/auth/verify-email",
                status: res.status,
                statusText: res.statusText,
                responseBody,
            });
            return {success: false, status: res.status};
        }

        grafanaClient.info("Email verified successfully", {route: "GET /api/auth/verify-email"});
        return {success: true};
    } catch (e) {
        grafanaClient.error("Email verification request failed", {
            route: "GET /api/auth/verify-email",
            error: e,
        });
        return {success: false, status: 500};
    }
}
