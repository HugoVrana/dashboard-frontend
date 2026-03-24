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
});
