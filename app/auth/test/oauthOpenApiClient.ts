import createClient from "openapi-fetch";
import {paths} from "@/app/auth/test/oauth-v2-schema";
import {getDashboardAuthRenderUrl} from "@/app/auth/dashboardAuthApiContext";

export const oauthApiClient = createClient<paths>({
    baseUrl: getDashboardAuthRenderUrl(),
});