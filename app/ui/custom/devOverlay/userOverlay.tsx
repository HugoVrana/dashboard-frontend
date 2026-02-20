"use client";

import { usePermissions } from "@/app/lib/permission/permissionsClient";
import { ScrollArea } from "@/app/ui/base/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/ui/base/card";
import { Badge } from "@/app/ui/base/badge";
import { Skeleton } from "@/app/ui/base/skeleton";

export default function UserOverlay() {
    const { userEmail, userRoles, userGrants, getAuthToken, session, isLoading } = usePermissions();

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                        <Skeleton className="h-4 w-full bg-gray-700" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    const image = session?.user?.image ?? "";

    return (
        <div className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-white">Email</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-xs text-gray-400 break-all">
                        {userEmail || "—"}
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-white">Roles</CardTitle>
                </CardHeader>
                <CardContent>
                    {userRoles.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                            {userRoles.map((role : any) => (
                                <Badge key={role} variant="secondary" className="bg-gray-700 text-gray-300">
                                    {role}
                                </Badge>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-gray-400">—</p>
                    )}
                </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-white">Grants</CardTitle>
                </CardHeader>
                <CardContent>
                    {userGrants.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                            {userGrants.map((grant : any) => (
                                <Badge key={grant} variant="secondary" className="bg-gray-700 text-gray-300">
                                    {grant}
                                </Badge>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-gray-400">—</p>
                    )}
                </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-white">Token</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-20">
                        <p className="text-xs text-gray-400 font-mono break-all">
                            {getAuthToken || "—"}
                        </p>
                    </ScrollArea>
                </CardContent>
            </Card>

            <Card className={"bg-gray-800 border-gray-700"}>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-white">Image</CardTitle>
                </CardHeader>
                <CardContent>
                    {
                        image
                    }
                </CardContent>
            </Card>
        </div>
    );
}
