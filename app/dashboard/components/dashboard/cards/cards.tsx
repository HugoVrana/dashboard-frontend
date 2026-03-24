"use client"

import {useEffect, useState} from "react";
import {CardsSkeleton} from "@/app/dashboard/components/skeletons/cardsSkeleton";
import CardWithPermission from "@/app/dashboard/components/dashboard/cards/cardWithPermission";
import {usePermissions} from "@/app/auth/permission/permissionsClient";
import {useDebugTranslations} from "@/app/shared/contexts/translations/useDebugTranslations";
import {useCustomersApi} from "@/app/dashboard/hooks/useCustomersApi";
import {useInvoicesApi} from "@/app/dashboard/hooks/useInvoicesApi";

export default function Cards() {
    const {hasGrant, isLoading} = usePermissions();
    const {getCustomerCount} = useCustomersApi();
    const {getInvoiceAmount, getInvoiceCount} = useInvoicesApi();

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
        if (isLoading) return;

        const invoices : boolean = hasGrant("dashboard-invoices-read");
        const customer : boolean = hasGrant("dashboard-customers-read");

        setCanViewInvoices(invoices);
        setCanViewCustomer(customer);

        async function loadData() {
            setDataLoading(true);
            try {
                if (customer) {
                    const customerCount = await getCustomerCount();
                    // Only update state if we got valid data (null means error occurred)
                    if (customerCount !== null) {
                        setCustomersCount(customerCount);
                    }
                }

                if (invoices) {
                    const [paid, pending, invoiceCount, customerCount] = await Promise.all([
                        getInvoiceAmount("paid"),
                        getInvoiceAmount("pending"),
                        getInvoiceCount(""),
                        getCustomerCount()
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
    }, [isLoading, hasGrant, getCustomerCount, getInvoiceAmount, getInvoiceCount]);

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