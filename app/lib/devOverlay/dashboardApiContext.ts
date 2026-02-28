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