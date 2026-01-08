export const DASHBOARD_AUTH_API_CONFIG = {
    LOCAL_URL: "http://localhost:8081",
    CLOUD_URL: "https://spring-dashboard-oauth.onrender.com",
} as const

export function getDashboardAuthLocalUrl() : string {
    const url : string = DASHBOARD_AUTH_API_CONFIG.LOCAL_URL;
    console.log("Getting local url: " + url);
    return url;
}

export function getDashboardAuthRenderUrl() : string {
    const url : string = DASHBOARD_AUTH_API_CONFIG.CLOUD_URL;
    console.log("Getting render url: " + url);
    return url;
}