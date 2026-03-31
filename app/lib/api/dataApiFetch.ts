import { DASHBOARD_API_CONFIG } from "@/app/dashboard/dashboardApiContext";

export type DataApiFetchOptions = RequestInit & {
    /** Override the base URL. Defaults to the cloud URL or DASHBOARD_API_URL env var. */
    baseUrl?: string;
};

function dataApiFetch<T>(path: string, options: DataApiFetchOptions): Promise<T> {
    const baseUrl = options.baseUrl ?? process.env.NEXT_PUBLIC_DASHBOARD_API_URL ?? DASHBOARD_API_CONFIG.CLOUD_URL;
    const { baseUrl: _removed, ...fetchOptions } = options;
    return fetch(`${baseUrl}${path}`, fetchOptions).then(function(res) {
        var bodyPromise = [204, 205, 304].includes(res.status) ? Promise.resolve(null) : res.text();
        return bodyPromise.then(function(body) {
            var data = body ? JSON.parse(body) : {};
            return { data: data, status: res.status, headers: res.headers };
        });
    }) as Promise<T>;
}

/** Builds RequestInit options with baseUrl + Authorization header for the data API. */
function dataApiOptions(baseUrl: string, authToken: string): RequestInit {
    return { baseUrl, headers: { Authorization: `Bearer ${authToken}`, Accept: "application/json" } } as RequestInit;
}

export { dataApiFetch, dataApiOptions };
