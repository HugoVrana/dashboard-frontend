"use client"

import {useContext} from "react";
import {ApiContext} from "@/app/lib/devOverlay/apiContext";

export default function APIConfigOverlay() {
    const context = useContext(ApiContext);

    // Destructure from context
    const {
        dashboardApiIsLocal,
        dashboardApiUrl,
        dashboardToggleMode,
        dashboardAuthApiIsLocal,
        dashboardAuthApiUrl,
        dashboardAuthToggleMode
    } = context;

    const handleDashboardToggle = () => {
        console.log("[DevOverlay] Dashboard toggle clicked, current isLocal:", dashboardApiIsLocal)
        dashboardToggleMode()
    }

    const handleAuthToggle = () => {
        console.log("[DevOverlay] Auth toggle clicked, current isLocal:", dashboardAuthApiIsLocal)
        dashboardAuthToggleMode()
    }

    return (
        <div>
            {/* Dashboard API Switch */}
            <div>
                <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Dashboard API:</span>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleDashboardToggle}
                            className={`relative w-24 h-8 rounded-full transition-colors duration-200 ease-in-out 
                                                    flex items-center px-1 ${dashboardApiIsLocal ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}`}
                        >
                            <div className="absolute inset-0 flex items-center justify-between px-2 text-xs font-bold text-white">
                                                    <span className={`transition-opacity duration-300 ${!dashboardApiIsLocal ? "opacity-100 visible" : "opacity-40 invisible"}`}>
                                                        Render
                                                    </span>
                                <span className={`transition-opacity duration-300 ${dashboardApiIsLocal ? "opacity-100 visible" : "opacity-40 invisible"}`}>
                                                        Local
                                                    </span>
                            </div>
                            <div className={`relative w-7 h-7 bg-white rounded-full shadow-md z-10
                                                    transition-transform duration-300 ease-in-out
                                                    ${dashboardApiIsLocal ? "translate-x-0" : "translate-x-14"}`} />
                        </button>
                    </div>
                </div>
                {/* Current API URL display */}
                <div className="text-xs text-gray-400 break-all">
                    <div>URL: {dashboardApiUrl}</div>
                    <div>Mode: {dashboardApiIsLocal ? "Local" : "Cloud"}</div>
                </div>
            </div>

            {/* Dashboard Auth API Switch */}
            <div>
                <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Auth API:</span>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleAuthToggle}
                            className={`relative w-24 h-8 rounded-full transition-colors duration-200 ease-in-out 
                                                    flex items-center px-1 ${dashboardAuthApiIsLocal ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}`}
                        >
                            <div className="absolute inset-0 flex items-center justify-between px-2 text-xs font-bold text-white">
                                                    <span className={`transition-opacity duration-300 ${!dashboardAuthApiIsLocal ? "opacity-100 visible" : "opacity-40 invisible"}`}>
                                                        Render
                                                    </span>
                                <span className={`transition-opacity duration-300 ${dashboardAuthApiIsLocal ? "opacity-100 visible" : "opacity-40 invisible"}`}>
                                                        Local
                                                    </span>
                            </div>
                            <div className={`relative w-7 h-7 bg-white rounded-full shadow-md z-10
                                                    transition-transform duration-300 ease-in-out
                                                    ${dashboardAuthApiIsLocal ? "translate-x-0" : "translate-x-14"}`} />
                        </button>
                    </div>
                </div>
                {/* Current API URL display */}
                <div className="text-xs text-gray-400 break-all">
                    <div>URL: {dashboardAuthApiUrl}</div>
                    <div>Mode: {dashboardAuthApiIsLocal ? "Local" : "Cloud"}</div>
                </div>
            </div>
        </div>
    );
}