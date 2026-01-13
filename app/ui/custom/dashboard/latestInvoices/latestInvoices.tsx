"use client"

import {Suspense, useContext, useEffect, useState} from "react";
import {ApiContext} from "@/app/lib/devOverlay/apiContext";
import {usePermissions} from "@/app/lib/permission/permissionsClient";
import {InvoiceRead} from "@/app/models/invoice/invoiceRead";
import {getLatestInvoices} from "@/app/lib/dataAccess/invoicesClient";
import {LatestInvoicesSkeleton} from "@/app/ui/custom/skeletons/latestInvoiceSkeleton";
import LatestInvoicesWithPermission from "@/app/ui/custom/dashboard/latestInvoices/latestInvoicesWithPermission";

export default function LatestInvoices() {
    const { dashboardApiIsLocal } = useContext(ApiContext);
    const {hasGrant, isLoading, getAuthToken} = usePermissions();

    const [canViewInvoices, setCanViewInvoices] = useState(false);
    const [canViewCustomer, setCanViewCustomer] = useState(false);
    const [canViewInvoicesAndCustomer, setCanViewInvoicesAndCustomer] = useState(canViewInvoices && canViewCustomer);

    const [latestInvoices, setLatestInvoices] = useState<InvoiceRead[] | null>(null);

    const skellyProps = {showShimmer : true};
    const skellyNoPermissionProps = {showShimmer : false};

    useEffect(() => {
        if (isLoading) return;

        const invoicesPermission : boolean = hasGrant("dashboard-invoices-read");
        setCanViewInvoices(invoicesPermission);

        const customerPermission : boolean = hasGrant("dashboard-customers-read");
        setCanViewCustomer(customerPermission);

        setCanViewInvoicesAndCustomer(invoicesPermission && customerPermission);

        async function loadData() {
            try {
                if (canViewInvoicesAndCustomer) {
                    const latestInvoices : InvoiceRead[] | null = await getLatestInvoices(dashboardApiIsLocal, getAuthToken);
                    setLatestInvoices(latestInvoices);
                }
            } catch (error) {
                console.error("Failed to load data:", error);
            }
        }

        loadData();
    }, [dashboardApiIsLocal, isLoading, hasGrant, getAuthToken])

    return (
        <Suspense fallback={<LatestInvoicesSkeleton skeletonProps={skellyProps}/>}>
            <LatestInvoicesWithPermission hasPermission={canViewInvoicesAndCustomer}
                                          invoices={latestInvoices ?? []}
                                          skeletonProps={skellyNoPermissionProps}/>
        </Suspense>
    )
}