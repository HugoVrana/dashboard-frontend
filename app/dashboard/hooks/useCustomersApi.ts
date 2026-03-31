"use client"

import {useCallback, useContext} from "react";
import {ApiContext} from "@/app/shared/components/devOverlay/apiContext";
import {usePermissions} from "@/app/auth/permission/permissionsClient";
import {getCustomers, getCustomerCount} from "@/app/dashboard/dataAccess/customersClient";

export function useCustomersApi() {
    const {dashboardApiIsLocal} = useContext(ApiContext);
    const {getAuthToken} = usePermissions();

    return {
        getCustomers: useCallback(
            () => getCustomers(dashboardApiIsLocal, getAuthToken),
            [dashboardApiIsLocal, getAuthToken]
        ),
        getCustomerCount: useCallback(
            () => getCustomerCount(dashboardApiIsLocal, getAuthToken),
            [dashboardApiIsLocal, getAuthToken]
        ),
    };
}
