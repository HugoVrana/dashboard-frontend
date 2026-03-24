"use client"

import {useCallback, useContext} from "react";
import {ApiContext} from "@/app/shared/components/devOverlay/apiContext";
import {usePermissions} from "@/app/auth/permission/permissionsClient";
import {getRevenue} from "@/app/dashboard/dataAccess/revenueClient";

export function useRevenueApi() {
    const {dashboardApiIsLocal} = useContext(ApiContext);
    const {getAuthToken} = usePermissions();

    return {
        getRevenue: useCallback(
            () => getRevenue(dashboardApiIsLocal, getAuthToken),
            [dashboardApiIsLocal, getAuthToken]
        ),
    };
}
