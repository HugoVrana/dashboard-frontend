"use client"

import {useState, useEffect, useContext} from "react"
import APIConfigOverlay from "@/app/ui/devOverlay/apiConfigOverlay";
import UserOverlay from "@/app/ui/devOverlay/userOverlay";
import {ApiContext} from "@/app/lib/devOverlay/apiContext";

type Tab = "api" | "user";

export function DevOverlay() {
    const context = useContext(ApiContext);
    const [isVisible, setIsVisible] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>("api");

    useEffect(() => {
        // Only show in development
        if (process.env.NODE_ENV === "development") {
            setIsVisible(true)
        }
    }, [])

    console.log("[DevOverlay] context:", context)

    if (!context) {
        console.error("[DevOverlay] ApiContext is null - DevOverlay not wrapped in APIProvider")
        return null
    }

    const handleExpand = () => {
        console.log("[DevOverlay] Expand clicked")
        setIsExpanded(true)
    }

    const handleCollapse = () => {
        console.log("[DevOverlay] Collapse clicked")
        setIsExpanded(false)
    }

    if (!isVisible) return null

    return (
        <div className="fixed bottom-20 right-4 z-50">
            {/* Collapsed state - just a small indicator */}
            {!isExpanded && (
                <button
                    onClick={handleExpand}
                    className="bg-gray-900 text-white p-2 rounded-full shadow-lg hover:bg-gray-800 transition-colors"
                    title="Development Tools">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path
                            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                </button>
            )}

            {/* Expanded state - full dev panel */}
            {isExpanded && (
                <div className="bg-gray-900 text-white p-4 rounded-lg shadow-xl backdrop-blur-sm min-w-72">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold">Dev Tools</h3>
                        <button onClick={handleCollapse} className="text-gray-400 hover:text-white">
                            ×
                        </button>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex border-b border-gray-700 mb-4">
                        <button
                            onClick={() => setActiveTab("api")}
                            className={`flex-1 py-2 px-3 text-sm font-medium transition-colors
                                ${activeTab === "api"
                                ? "text-white border-b-2 border-blue-500"
                                : "text-gray-400 hover:text-gray-200"}`}
                        >
                            API Config
                        </button>
                        <button
                            onClick={() => setActiveTab("user")}
                            className={`flex-1 py-2 px-3 text-sm font-medium transition-colors
                                ${activeTab === "user"
                                ? "text-white border-b-2 border-blue-500"
                                : "text-gray-400 hover:text-gray-200"}`}
                        >
                            User Info
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="space-y-4">
                        {/* API Config Tab */}
                        {activeTab === "api" && (
                            <APIConfigOverlay/>
                        )}

                        {/* User Info Tab */}
                        {activeTab === "user" && (
                            <UserOverlay/>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}