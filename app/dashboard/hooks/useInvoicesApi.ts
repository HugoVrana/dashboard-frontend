"use client"

import {useCallback, useContext} from "react";
import {ApiContext} from "@/app/shared/components/devOverlay/apiContext";
import {usePermissions} from "@/app/auth/permission/permissionsClient";
import {
    getInvoiceAmount,
    getInvoiceCount,
    getLatestInvoices,
    getFilteredInvoices,
    getInvoice,
} from "@/app/dashboard/dataAccess/invoicesClient";

export function useInvoicesApi() {
    const {dashboardApiIsLocal} = useContext(ApiContext);
    const {getAuthToken} = usePermissions();

    return {
        getInvoiceAmount: useCallback(
            (status?: string) => getInvoiceAmount(dashboardApiIsLocal, getAuthToken, status),
            [dashboardApiIsLocal, getAuthToken]
        ),
        getInvoiceCount: useCallback(
            (status: string) => getInvoiceCount(dashboardApiIsLocal, getAuthToken, status),
            [dashboardApiIsLocal, getAuthToken]
        ),
        getLatestInvoices: useCallback(
            () => getLatestInvoices(dashboardApiIsLocal, getAuthToken),
            [dashboardApiIsLocal, getAuthToken]
        ),
        getFilteredInvoices: useCallback(
            (searchTerm: string, page: number) => getFilteredInvoices(dashboardApiIsLocal, getAuthToken, searchTerm, page),
            [dashboardApiIsLocal, getAuthToken]
        ),
        getInvoice: useCallback(
            (id: string) => getInvoice(dashboardApiIsLocal, getAuthToken, id),
            [dashboardApiIsLocal, getAuthToken]
        ),
    };
}
