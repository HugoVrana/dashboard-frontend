import createClient from "openapi-fetch";
import {getDashboardAuthRenderUrl} from "@/app/auth/dashboardAuthApiContext";
import {paths} from "@/app/auth/test/auth/oauth-v2-schema";

export const oauthApiClient = createClient<paths>({
    baseUrl: getDashboardAuthRenderUrl(),
});