"use client"

import {useEffect, useState} from "react";
import {InvoiceRead} from "@/app/dashboard/models/invoiceRead";
import {LatestInvoicesSkeleton} from "@/app/dashboard/components/skeletons/latestInvoiceSkeleton";
import LatestInvoicesWithPermission from "@/app/dashboard/components/dashboard/latestInvoices/latestInvoicesWithPermission";
import {usePermissions} from "@/app/auth/permission/permissionsClient";
import {useInvoicesApi} from "@/app/dashboard/hooks/useInvoicesApi";

export default function LatestInvoices() {
    const {hasGrant, isLoading} = usePermissions();
    const {getLatestInvoices} = useInvoicesApi();

    const [canViewInvoices, setCanViewInvoices] = useState(false);
    const [canViewCustomer, setCanViewCustomer] = useState(false);
    const [canViewInvoicesAndCustomer, setCanViewInvoicesAndCustomer] = useState(canViewInvoices && canViewCustomer);
    const [dataLoading, setDataLoading] = useState(true);

    const [latestInvoices, setLatestInvoices] = useState<InvoiceRead[] | null>(null);

    const skellyProps = {showShimmer : true};
    const skellyNoPermissionProps = {showShimmer : false};

    useEffect(() => {
        if (isLoading) return;

        const invoicesPermission : boolean = hasGrant("dashboard-invoices-read");
        setCanViewInvoices(invoicesPermission);

        const customerPermission : boolean = hasGrant("dashboard-customers-read");
        setCanViewCustomer(customerPermission);

        const hasAllPermissions : boolean = invoicesPermission && customerPermission;
        setCanViewInvoicesAndCustomer(hasAllPermissions);

        async function loadData() {
            setDataLoading(true);
            try {
                if (hasAllPermissions) {
                    const latestInvoices : InvoiceRead[] | null = await getLatestInvoices();
                    // Only update state if we got valid data
                    if (latestInvoices && latestInvoices.length > 0) {
                        console.log(latestInvoices);
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
    }, [isLoading, getLatestInvoices, hasGrant])

    if (dataLoading) {
        return <LatestInvoicesSkeleton skeletonProps={skellyProps}/>;
    }

    return (
        <LatestInvoicesWithPermission hasPermission={canViewInvoicesAndCustomer}
                                      invoices={latestInvoices ?? []}
                                      skeletonProps={skellyNoPermissionProps}/>
    )
}