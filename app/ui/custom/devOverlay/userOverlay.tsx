import {
    getAuthToken,
    getUserEmail,
    getUserGrants,
    getUserImageLink,
    getUserRoles
} from "@/app/lib/permission/permissionsServerClient";
import { ScrollArea } from "@/app/ui/base/scroll-area";
import {Card, CardContent, CardHeader, CardTitle} from "@/app/ui/base/card";
import {Badge} from "@/app/ui/base/badge";

export default async function UserOverlay() {
    const userEmail : string = await getUserEmail();
    const roles : string[] = await getUserRoles();
    const grants : string[] = await getUserGrants();
    const token : string = await getAuthToken();
    const image : string = await getUserImageLink();

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
                    {roles.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                            {roles.map((role) => (
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
                    {grants.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                            {grants.map((grant) => (
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
                            {token || "—"}
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
