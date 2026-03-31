import { defineConfig } from "orval";

export default defineConfig({
    oauthV2: {
        input: {
            target: "./app/auth/test/api-docs-v2.json",
        },
        output: {
            target: "app/lib/api/oauth-v2.ts",
            client: "fetch",
            baseUrl: process.env.OAUTH2_SERVER_URL ?? "https://dashboard-spring-oauth.onrender.com",
        },
    },
    dataApi: {
        input: {
            target: "./app/dashboard/test/data-api-docs.json",
        },
        output: {
            target: "app/lib/api/data-api.ts",
            client: "fetch",
            baseUrl: process.env.DASHBOARD_API_URL ?? "https://dashboard-spring-data.onrender.com",
        },
    },
});
