"use client"

import {Suspense, useContext, useEffect, useState} from "react";
import {ApiContext} from "@/app/lib/devOverlay/apiContext";
import {getCustomerCount} from "@/app/lib/dataAccess/customersClient";
import {getInvoiceAmount, getInvoiceCount} from "@/app/lib/dataAccess/invoicesClient";
import {CardsSkeleton} from "@/app/ui/custom/skeletons/cardsSkeleton";
import CardWithPermission from "@/app/ui/custom/dashboard/cards/cardWithPermission";
import {hasGrant} from "@/app/lib/permission/permissionsClient";

export default function Cards() {
    const { dashboardApiIsLocal } = useContext(ApiContext);

    const canViewInvoices : boolean = hasGrant("dashboard-invoices-read");
    const canViewCustomer : boolean = hasGrant("dashboard-customers-read");

    const [amountPaidInvoices, setAmountPaidInvoices] =
        useState<number | null>(null);
    const [amountPendingInvoices, setAmountPendingInvoices] = useState<number | null>(null);
    const [totalInvoices, setTotalInvoices] = useState<number | null>(null);
    const [customersCount, setCustomersCount] = useState<number | null>(null);

    const skellyProps = {showShimmer : true};
    const skellyNoPermissionProps = {showShimmer : false};

    useEffect(() => {
        async function loadData() {
            try {
                if (canViewCustomer) {
                    const customerCount = await getCustomerCount(dashboardApiIsLocal);
                    setCustomersCount(customerCount);
                }

                if (canViewInvoices) {
                    const [paid, pending, count] = await Promise.all([
                        getInvoiceAmount(dashboardApiIsLocal, "paid"),
                        getInvoiceAmount(dashboardApiIsLocal, "pending"),
                        getInvoiceCount(dashboardApiIsLocal, "")
                    ]);

                    setAmountPaidInvoices(paid);
                    setAmountPendingInvoices(pending);
                    setTotalInvoices(count);
                }
            } catch (error) {
                console.error("Failed to load data:", error);
            }
        }

        loadData();
    }, [dashboardApiIsLocal, canViewInvoices, canViewCustomer]);

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