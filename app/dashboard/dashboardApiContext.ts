export const DASHBOARD_API_CONFIG = {
    LOCAL_URL: "http://localhost:8080",
    CLOUD_URL: "https://dashboard-spring-data.onrender.com",
} as const

export function getDashboardLocalUrl() : string {
    const url : string = DASHBOARD_API_CONFIG.LOCAL_URL;
    console.log("Getting local url: " + url);
    return url;
}

export function getDashboardRenderUrl() : string {
    const url : string = DASHBOARD_API_CONFIG.CLOUD_URL;
    console.log("Getting render url: " + url);
    return url;
}

function getDataApiVersion() : string {
    return process.env.NEXT_PUBLIC_DASHBOARD_API_VERSION ?? "v1";
}

export function buildDataApiUrl(isLocal: boolean, path: string) : URL {
    const base = isLocal ? getDashboardLocalUrl() : getDashboardRenderUrl();
    return new URL(`/api/${getDataApiVersion()}${path}`, base);
}

export function buildDataApiUrlFromBase(serverUrl: string, path: string) : URL {
    return new URL(`/api/${getDataApiVersion()}${path}`, serverUrl);
}