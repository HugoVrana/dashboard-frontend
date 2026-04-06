"use client"

import {useCallback, useContext} from "react";
import {ApiContext} from "@/app/shared/components/devOverlay/apiContext";
import {usePermissions} from "@/app/auth/permission/permissionsClient";
import {getRolesClient} from "@/app/auth/dataAccess/rolesClient";
import {getGrantsClient} from "@/app/auth/dataAccess/grantsClient";

export function useRolesApi() {
    const {dashboardAuthApiIsLocal} = useContext(ApiContext);
    const {getAuthToken} = usePermissions();

    return {
        getRoles: useCallback(
            () => getRolesClient(dashboardAuthApiIsLocal, getAuthToken),
            [dashboardAuthApiIsLocal, getAuthToken]
        ),
        getGrants: useCallback(
            () => getGrantsClient(dashboardAuthApiIsLocal, getAuthToken),
            [dashboardAuthApiIsLocal, getAuthToken]
        ),
    };
}
