import {getAuthToken, getUserEmail, getUserGrants, getUserRoles} from "@/app/lib/permission/permissionsServerClient";

export default function UserOverlay() {
    const userEmail : string = getUserEmail();
    const roles : string[] = getUserRoles();
    const grants : string[] = getUserGrants();
    const token : string = getAuthToken();
    return(
        <>
            {/*User Info: Email*/}
            <div>
                <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Email:</span>
                </div>
                <div className="text-xs text-gray-400 break-all">
                    <div>{userEmail || "—"}</div>
                </div>
            </div>

            {/*User Info: Roles*/}
            <div>
                <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Roles:</span>
                </div>
                <div className="text-xs text-gray-400 break-all">
                    <div>{roles.length > 0 ? roles.join(", ") : "—"}</div>
                </div>
            </div>

            {/*User Info: Grants*/}
            <div>
                <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Grants:</span>
                </div>
                <div className="text-xs text-gray-400 break-all">
                    <div>{grants.length > 0 ? grants.join(", ") : "—"}</div>
                </div>
            </div>

            {/*User Info: Auth token*/}
            <div>
                <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Token:</span>
                </div>
                <div className="text-xs text-gray-400 break-all">
                    <div>{token}</div>
                </div>
            </div>
        </>
    );
}