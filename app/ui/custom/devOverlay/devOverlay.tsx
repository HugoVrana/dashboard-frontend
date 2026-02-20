"use client"

import { useState, useEffect, useContext } from "react"
import { Settings, X } from "lucide-react"
import APIConfigOverlay from "@/app/ui/custom/devOverlay/apiConfigOverlay";
import UserOverlay from "@/app/ui/custom/devOverlay/userOverlay";
import TranslationOverlay from "@/app/ui/custom/devOverlay/translationOverlay";
import { ApiContext } from "@/app/lib/devOverlay/apiContext";
import { ThemeContext } from "@/app/lib/theme/themeContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/ui/base/tabs";
import {Button} from "@/app/ui/base/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/app/ui/base/card";

export function DevOverlay() {
    const context = useContext(ApiContext);
    const { isDark } = useContext(ThemeContext);
    const [isVisible, setIsVisible] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        if (process.env.NODE_ENV === "development") {
            setIsVisible(true)
        }
    }, [])

    if (!context) {
        console.error("[DevOverlay] ApiContext is null - DevOverlay not wrapped in APIProvider")
        return null
    }

    if (!isVisible) return null

    return (
        <div className="fixed bottom-20 right-4 z-50">
            {!isExpanded ? (
                <Button
                    onClick={() => setIsExpanded(true)}
                    size="icon"
                    className={`h-12 w-12 rounded-full shadow-lg ${
                        isDark
                            ? "bg-gray-900 hover:bg-gray-800 text-white"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                    title="Development Tools"
                >
                    <Settings className="h-6 w-6" />
                </Button>
            ) : (
                <Card className="bg-gray-900 border-gray-700 shadow-xl min-w-80">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-semibold text-white">Dev Tools</CardTitle>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsExpanded(false)}
                                className="h-6 w-6 text-gray-400 hover:text-white hover:bg-gray-800"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="api" className="w-full">
                            <TabsList className="grid w-full grid-cols-3 bg-gray-800">
                                <TabsTrigger
                                    value="api"
                                    className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-400"
                                >
                                    API
                                </TabsTrigger>
                                <TabsTrigger
                                    value="user"
                                    className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-400"
                                >
                                    User
                                </TabsTrigger>
                                <TabsTrigger
                                    value="i18n"
                                    className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-400"
                                >
                                    i18n
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="api" className="mt-4">
                                <APIConfigOverlay />
                            </TabsContent>
                            <TabsContent value="user" className="mt-4">
                                <UserOverlay />
                            </TabsContent>
                            <TabsContent value="i18n" className="mt-4">
                                <TranslationOverlay />
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}