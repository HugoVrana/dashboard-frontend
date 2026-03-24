import { defineConfig } from "orval";

export default defineConfig({
    dataApi: {
        input: {
            target: "./app/dashboard/test/data-api-docs.json",
        },
        output: {
            target: "app/lib/api/data",
            client: "fetch",
            mode: "tags",
            override: {
                mutator: {
                    path: "app/lib/api/dataApiFetch.ts",
                    name: "dataApiFetch",
                },
            },
        },
    },
});
