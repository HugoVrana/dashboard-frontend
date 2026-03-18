"use client"

import {useContext, useEffect, useState} from "react";
import {CardsSkeleton} from "@/app/dashboard/components/skeletons/cardsSkeleton";
import CardWithPermission from "@/app/dashboard/components/dashboard/cards/cardWithPermission";
import {ApiContext} from "@/app/shared/components/devOverlay/apiContext";
import {usePermissions} from "@/app/auth/permission/permissionsClient";
import {useDebugTranslations} from "@/app/shared/contexts/translations/useDebugTranslations";
import {getCustomerCount} from "@/app/dashboard/dataAccess/customersClient";
import {getInvoiceAmount, getInvoiceCount} from "@/app/dashboard/dataAccess/invoicesClient";

export default function Cards() {
    const { dashboardApiIsLocal, isReady: apiContextReady } = useContext(ApiContext);
    const {hasGrant, isLoading, getAuthToken} = usePermissions();

    const [canViewInvoices, setCanViewInvoices] = useState(false);
    const [canViewCustomer, setCanViewCustomer] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);

    const [amountPaidInvoices, setAmountPaidInvoices] = useState<number | null>(null);
    const [amountPendingInvoices, setAmountPendingInvoices] = useState<number | null>(null);
    const [totalInvoices, setTotalInvoices] = useState<number | null>(null);
    const [customersCount, setCustomersCount] = useState<number | null>(null);

    const skellyProps = {showShimmer : true};
    const skellyNoPermissionProps = {showShimmer : false};

    const t = useDebugTranslations("dashboard.controls.cards");

    useEffect(() => {
        if (!apiContextReady || isLoading || !getAuthToken) return;

        const invoices : boolean = hasGrant("dashboard-invoices-read");
        const customer : boolean = hasGrant("dashboard-customers-read");

        setCanViewInvoices(invoices);
        setCanViewCustomer(customer);

        async function loadData() {
            setDataLoading(true);
            try {
                if (customer) {
                    const customerCount = await getCustomerCount(dashboardApiIsLocal, getAuthToken);
                    // Only update state if we got valid data (null means error occurred)
                    if (customerCount !== null) {
                        setCustomersCount(customerCount);
                    }
                }

                if (invoices) {
                    const [paid, pending, invoiceCount, customerCount] = await Promise.all([
                        getInvoiceAmount(dashboardApiIsLocal, getAuthToken, "paid"),
                        getInvoiceAmount(dashboardApiIsLocal, getAuthToken, "pending"),
                        getInvoiceCount(dashboardApiIsLocal, getAuthToken, ""),
                        getCustomerCount(dashboardApiIsLocal, getAuthToken)
                    ]);
                    console.log("invoices", paid, pending, invoiceCount, customerCount);

                    // Only update state if we got valid data (null means error occurred)
                    if (paid !== null) setAmountPaidInvoices(paid);
                    if (pending !== null) setAmountPendingInvoices(pending);
                    if (invoiceCount !== null) setTotalInvoices(invoiceCount);
                    if (customerCount !== null) setCustomersCount(customerCount);
                }
            } catch (error) {
                console.error("Failed to load data:", error);
            } finally {
                setDataLoading(false);
            }
        }

        loadData();
    }, [apiContextReady, dashboardApiIsLocal, isLoading, getAuthToken, hasGrant]);

    if (dataLoading) {
        return <CardsSkeleton skeletonProps={skellyProps}/>;
    }

    return (
        <>
            <CardWithPermission hasPermission={canViewInvoices}
                                title={t('amountPaidInvoices')}
                                value={amountPaidInvoices?.toString() ?? "0"}
                                type={"collected"}
                                skeletonProps={skellyNoPermissionProps} />

            <CardWithPermission hasPermission={canViewInvoices}
                                title={t('amountPendingInvoices')}
                                value={amountPendingInvoices?.toString() ?? "0"}
                                type={"pending"}
                                skeletonProps={skellyNoPermissionProps} />

            <CardWithPermission hasPermission={canViewInvoices}
                                title={t('totalInvoices')}
                                value={totalInvoices?.toString() ?? "0"}
                                type={"invoices"}
                                skeletonProps={skellyNoPermissionProps} />

            <CardWithPermission hasPermission={canViewCustomer}
                                title={t('totalCustomers')}
                                value={customersCount?.toString() ?? "0"}
                                type={"customers"}
                                skeletonProps={skellyNoPermissionProps} />
        </>
    )
}