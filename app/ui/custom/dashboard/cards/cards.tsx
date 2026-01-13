"use client"

import {Suspense, useContext, useEffect, useState} from "react";
import {ApiContext} from "@/app/lib/devOverlay/apiContext";
import {getCustomerCount} from "@/app/lib/dataAccess/customersClient";
import {getInvoiceAmount, getInvoiceCount} from "@/app/lib/dataAccess/invoicesClient";
import {CardsSkeleton} from "@/app/ui/custom/skeletons/cardsSkeleton";
import CardWithPermission from "@/app/ui/custom/dashboard/cards/cardWithPermission";
import {usePermissions} from "@/app/lib/permission/permissionsClient";

export default function Cards() {
    const { dashboardApiIsLocal } = useContext(ApiContext);
    const {hasGrant, isLoading, getAuthToken} = usePermissions();

    const [canViewInvoices, setCanViewInvoices] = useState(false);
    const [canViewCustomer, setCanViewCustomer] = useState(false);

    const [amountPaidInvoices, setAmountPaidInvoices] = useState<number | null>(null);
    const [amountPendingInvoices, setAmountPendingInvoices] = useState<number | null>(null);
    const [totalInvoices, setTotalInvoices] = useState<number | null>(null);
    const [customersCount, setCustomersCount] = useState<number | null>(null);

    const skellyProps = {showShimmer : true};
    const skellyNoPermissionProps = {showShimmer : false};

    useEffect(() => {
        if (isLoading) return;

        const invoices : boolean = hasGrant("dashboard-invoices-read");
        const customer : boolean = hasGrant("dashboard-customers-read");

        setCanViewInvoices(invoices);
        setCanViewCustomer(customer);

        async function loadData() {
            try {
                if (canViewCustomer) {
                    const customerCount = await getCustomerCount(dashboardApiIsLocal, getAuthToken);
                    setCustomersCount(customerCount);
                }

                if (canViewInvoices) {
                    const [paid, pending, count] = await Promise.all([
                        getInvoiceAmount(dashboardApiIsLocal, getAuthToken, "paid"),
                        getInvoiceAmount(dashboardApiIsLocal, getAuthToken, "pending"),
                        getInvoiceCount(dashboardApiIsLocal, getAuthToken, "")
                    ]);
                    console.log("invoices", paid, pending, count);
                    setAmountPaidInvoices(paid);
                    setAmountPendingInvoices(pending);
                    setTotalInvoices(count);
                }
            } catch (error) {
                console.error("Failed to load data:", error);
            }
        }

        loadData();
    }, [dashboardApiIsLocal, isLoading, hasGrant, getAuthToken]);

    return (
        <Suspense fallback={<CardsSkeleton skeletonProps={skellyProps}/>}>
            <CardWithPermission hasPermission={canViewInvoices}
                                title={"Total Paid Invoices"}
                                value={amountPaidInvoices?.toString() ?? "0"}
                                type={"collected"}
                                skeletonProps={skellyNoPermissionProps} />

            <CardWithPermission hasPermission={canViewInvoices}
                                title={"Total Pending Invoices"}
                                value={amountPendingInvoices?.toString() ?? "0"}
                                type={"pending"}
                                skeletonProps={skellyNoPermissionProps} />

            <CardWithPermission hasPermission={canViewInvoices}
                                title={"Total Invoices"}
                                value={totalInvoices?.toString() ?? "0"}
                                type={"invoices"}
                                skeletonProps={skellyNoPermissionProps} />

            <CardWithPermission hasPermission={canViewCustomer}
                                title={"Total Customers"}
                                value={customersCount?.toString() ?? "0"}
                                type={"customers"}
                                skeletonProps={skellyNoPermissionProps} />
        </Suspense>
    )
}