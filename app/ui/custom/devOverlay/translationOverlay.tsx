"use client"

import { useTranslationDebug } from "@/app/lib/devOverlay/translationDebugContext"
import { Badge } from "@/app/ui/base/badge"
import { Button } from "@/app/ui/base/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/ui/base/card"
import { Label } from "@/app/ui/base/label"

export default function TranslationOverlay() {
    const { showKeys, toggleShowKeys } = useTranslationDebug()

    return (
        <div className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-white">Translation Display</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex gap-1 p-1 bg-gray-700 rounded-lg">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleShowKeys}
                            className={`flex-1 ${
                                !showKeys
                                    ? "bg-blue-600 text-white hover:bg-blue-700 hover:text-white"
                                    : "text-gray-300 hover:bg-gray-600 hover:text-white"
                            }`}
                        >
                            Translations
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleShowKeys}
                            className={`flex-1 ${
                                showKeys
                                    ? "bg-orange-600 text-white hover:bg-orange-700 hover:text-white"
                                    : "text-gray-300 hover:bg-gray-600 hover:text-white"
                            }`}
                        >
                            Keys
                        </Button>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Label className="text-xs text-gray-400">Mode:</Label>
                            <Badge className={showKeys ? "bg-orange-600 hover:bg-orange-600" : "bg-blue-600 hover:bg-blue-600"}>
                                {showKeys ? "Showing Keys" : "Showing Translations"}
                            </Badge>
                        </div>
                        <p className="text-xs text-gray-400">
                            {showKeys
                                ? "Labels display as [namespace.key]"
                                : "Labels display translated text"}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
