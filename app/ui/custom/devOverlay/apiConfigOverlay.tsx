"use client"

import {useContext} from "react";
import {ApiContext} from "@/app/lib/devOverlay/apiContext";
import {Badge} from "@/app/ui/base/badge";
import {Button} from "../../base/button";
import {Card, CardContent, CardHeader, CardTitle} from "../../base/card";
import {Label} from "@/app/ui/base/label";

export default function APIConfigOverlay() {
    const context = useContext(ApiContext);
    return (
        <div className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-white">Dashboard API</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex gap-1 p-1 bg-gray-700 rounded-lg">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={context.dashboardToggleMode}
                            className={`flex-1 ${
                                !context.dashboardApiIsLocal
                                    ? "bg-blue-600 text-white hover:bg-blue-700 hover:text-white"
                                    : "text-gray-300 hover:bg-gray-600 hover:text-white"
                            }`}
                        >
                            Cloud
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={context.dashboardToggleMode}
                            className={`flex-1 ${
                                context.dashboardApiIsLocal
                                    ? "bg-green-600 text-white hover:bg-green-700 hover:text-white"
                                    : "text-gray-300 hover:bg-gray-600 hover:text-white"
                            }`}
                        >
                            Local
                        </Button>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Label className="text-xs text-gray-400">Status:</Label>
                            <Badge className={context.dashboardApiIsLocal ? "bg-green-600 hover:bg-green-600" : "bg-blue-600 hover:bg-blue-600"}>
                                {context.dashboardApiIsLocal ? "Local" : "Cloud"}
                            </Badge>
                        </div>
                        <p className="text-xs text-gray-400 font-mono break-all">
                            {context.dashboardApiUrl}
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-white">Auth API</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex gap-1 p-1 bg-gray-700 rounded-lg">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={context.dashboardAuthToggleMode}
                            className={`flex-1 ${
                                !context.dashboardAuthApiIsLocal
                                    ? "bg-blue-600 text-white hover:bg-blue-700 hover:text-white"
                                    : "text-gray-300 hover:bg-gray-600 hover:text-white"
                            }`}
                        >
                            Cloud
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={context.dashboardAuthToggleMode}
                            className={`flex-1 ${
                                context.dashboardAuthApiIsLocal
                                    ? "bg-green-600 text-white hover:bg-green-700 hover:text-white"
                                    : "text-gray-300 hover:bg-gray-600 hover:text-white"
                            }`}
                        >
                            Local
                        </Button>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Label className="text-xs text-gray-400">Status:</Label>
                            <Badge className={context.dashboardAuthApiIsLocal ? "bg-green-600 hover:bg-green-600" : "bg-blue-600 hover:bg-blue-600"}>
                                {context.dashboardAuthApiIsLocal
                                    ? "Local"
                                    : "Cloud"}
                            </Badge>
                        </div>
                        <p className="text-xs text-gray-400 font-mono break-all">
                            {context.dashboardAuthApiUrl}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}