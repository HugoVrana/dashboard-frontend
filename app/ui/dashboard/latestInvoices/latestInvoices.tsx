"use client"

import {useContext, useEffect, useState} from "react";
import {ApiContext} from "@/app/lib/devOverlay/apiContext";
import {usePermissions} from "@/app/lib/permission/permissionsClient";
import {InvoiceRead} from "@/app/models/invoice/invoiceRead";
import {getLatestInvoices} from "@/app/lib/dataAccess/invoicesClient";
import {LatestInvoicesSkeleton} from "@/app/ui/skeletons/latestInvoiceSkeleton";
import LatestInvoicesWithPermission from "@/app/ui/dashboard/latestInvoices/latestInvoicesWithPermission";

export default function LatestInvoices() {
    const { dashboardApiIsLocal, isReady: apiContextReady } = useContext(ApiContext);
    const {hasGrant, isLoading, getAuthToken} = usePermissions();

    const [canViewInvoices, setCanViewInvoices] = useState(false);
    const [canViewCustomer, setCanViewCustomer] = useState(false);
    const [canViewInvoicesAndCustomer, setCanViewInvoicesAndCustomer] = useState(canViewInvoices && canViewCustomer);
    const [dataLoading, setDataLoading] = useState(true);

    const [latestInvoices, setLatestInvoices] = useState<InvoiceRead[] | null>(null);

    const skellyProps = {showShimmer : true};
    const skellyNoPermissionProps = {showShimmer : false};

    useEffect(() => {
        if (!apiContextReady || isLoading || !getAuthToken) return;

        const invoicesPermission : boolean = hasGrant("dashboard-invoices-read");
        setCanViewInvoices(invoicesPermission);

        const customerPermission : boolean = hasGrant("dashboard-customers-read");
        setCanViewCustomer(customerPermission);

        const hasAllPermissions = invoicesPermission && customerPermission;
        setCanViewInvoicesAndCustomer(hasAllPermissions);

        async function loadData() {
            setDataLoading(true);
            try {
                if (hasAllPermissions) {
                    const latestInvoices : InvoiceRead[] | null = await getLatestInvoices(dashboardApiIsLocal, getAuthToken);
                    // Only update state if we got valid data
                    if (latestInvoices !== null) {
                        setLatestInvoices(latestInvoices);
                    }
                }
            } catch (error) {
                console.error("Failed to load data:", error);
            } finally {
                setDataLoading(false);
            }
        }

        loadData();
    }, [apiContextReady, dashboardApiIsLocal, isLoading, getAuthToken, hasGrant])

    if (dataLoading) {
        return <LatestInvoicesSkeleton skeletonProps={skellyProps}/>;
    }

    return (
        <LatestInvoicesWithPermission hasPermission={canViewInvoicesAndCustomer}
                                      invoices={latestInvoices ?? []}
                                      skeletonProps={skellyNoPermissionProps}/>
    )
}