"use client"

import {Context, createContext, type ReactNode, useEffect, useState} from "react"
import {getCookie, setCookie} from "@/app/lib/cookieUtil";
import {DASHBOARD_API_CONFIG} from "@/app/lib/devOverlay/dashboardApiContext";
import {DASHBOARD_AUTH_API_CONFIG} from "@/app/lib/devOverlay/dashboardAuthApiContext";
import {APIContextType} from "@/app/lib/devOverlay/apiContextType";

export const ApiContext : Context<APIContextType> = createContext<APIContextType>({
    dashboardApiIsLocal: true,
    dashboardAuthApiIsLocal: true,
    dashboardApiUrl: DASHBOARD_API_CONFIG.LOCAL_URL,
    dashboardAuthApiUrl : DASHBOARD_AUTH_API_CONFIG.LOCAL_URL,
    dashboardToggleMode: () => {},
    dashboardAuthToggleMode: () => {},
    isReady: false
})

export function APIProvider({children, id}: { children: ReactNode, id?: string }) {
    const [dashboardApiIsLocal, setDashboardApiIsLocal] = useState(true);
    const [dashboardApiUrl, setDashboardApiUrl] = useState("");
    const [dashboardAuthApiIsLocal, setDashboardAuthApiIsLocal] = useState(true);
    const [dashboardAuthApiUrl, setDashboardAuthApiUrl] = useState("");
    const [isReady, setIsReady] = useState(false);

    // Initialize dashboard auth API on mount
    useEffect(() => {
        async function loadPreferences() {
            // Load dashboard API preferences
            if (process.env.NODE_ENV === "development") {
                const saved = await getCookie("dev-dashboard-api-mode");
                console.log("Dashboard API Cookie value:", saved);
                const savedIsLocal = saved ? saved === "local" : true;
                console.log("Dashboard API Parsed isLocal:", savedIsLocal);

                setDashboardApiIsLocal(savedIsLocal)
                const url = savedIsLocal ? DASHBOARD_API_CONFIG.LOCAL_URL : DASHBOARD_API_CONFIG.CLOUD_URL
                setDashboardApiUrl(url)
                console.log("Setting Dashboard API URL to:", url)
            } else {
                setDashboardApiIsLocal(false)
                const url = DASHBOARD_API_CONFIG.CLOUD_URL
                setDashboardApiUrl(url)
                console.log("Setting Dashboard API URL to:", url)
            }

            // Load dashboard auth API preferences
            if (process.env.NODE_ENV === "development") {
                const saved = await getCookie("dev-dashboard-auth-api-mode");
                console.log("Dashboard Auth API Cookie value:", saved);
                const savedIsLocal = saved ? saved === "local" : true;
                console.log("Dashboard Auth API Parsed isLocal:", savedIsLocal);

                setDashboardAuthApiIsLocal(savedIsLocal)
                const url = savedIsLocal ? DASHBOARD_AUTH_API_CONFIG.LOCAL_URL : DASHBOARD_AUTH_API_CONFIG.CLOUD_URL
                setDashboardAuthApiUrl(url)
                console.log("Setting Dashboard Auth API URL to:", url)
            } else {
                setDashboardAuthApiIsLocal(false)
                const url = DASHBOARD_AUTH_API_CONFIG.CLOUD_URL
                setDashboardAuthApiUrl(url)
                console.log("Setting Dashboard Auth API URL to:", url)
            }

            // Mark as ready after both preferences are loaded
            setIsReady(true);
            console.log("API Context is now ready");
        }

        loadPreferences();
    }, [])

    const dashboardToggleMode = async () => {
        console.log("Dashboard toggle clicked, current isLocal:", dashboardApiIsLocal)

        try {
            const newIsLocal = !dashboardApiIsLocal
            console.log("Dashboard calculated newIsLocal:", newIsLocal)

            setDashboardApiIsLocal(newIsLocal)
            const url = newIsLocal ? DASHBOARD_API_CONFIG.LOCAL_URL : DASHBOARD_API_CONFIG.CLOUD_URL
            setDashboardApiUrl(url)
            console.log("Setting Dashboard API URL to:", url)

            const modeValue = newIsLocal ? "local" : "cloud"
            localStorage.setItem("dev-dashboard-api-mode", modeValue)
            await setCookie("dev-dashboard-api-mode", modeValue)
            console.log("Dashboard saved mode:", modeValue)
        } catch (error) {
            console.error("Error in dashboard toggleMode:", error)
        }
    }

    const dashboardAuthToggleMode = async () => {
        console.log("Dashboard Auth toggle clicked, current isLocal:", dashboardAuthApiIsLocal)

        try {
            const newIsLocal = !dashboardAuthApiIsLocal
            console.log("Dashboard Auth calculated newIsLocal:", newIsLocal)

            setDashboardAuthApiIsLocal(newIsLocal)
            const url = newIsLocal ? DASHBOARD_AUTH_API_CONFIG.LOCAL_URL : DASHBOARD_AUTH_API_CONFIG.CLOUD_URL
            setDashboardAuthApiUrl(url)
            console.log("Setting Dashboard Auth API URL to:", url)

            const modeValue = newIsLocal ? "local" : "cloud"
            localStorage.setItem("dev-dashboard-auth-api-mode", modeValue)
            await setCookie("dev-dashboard-auth-api-mode", modeValue)
            console.log("Dashboard Auth saved mode:", modeValue)
        } catch (error) {
            console.error("Error in dashboard auth toggleMode:", error)
        }
    }

    return (
        <ApiContext.Provider
            key={id}
            value={{
                dashboardApiIsLocal,
                dashboardAuthApiIsLocal,
                dashboardApiUrl,
                dashboardAuthApiUrl,
                dashboardToggleMode,
                dashboardAuthToggleMode,
                isReady
            }}
        >
            {children}
        </ApiContext.Provider>
    )
}