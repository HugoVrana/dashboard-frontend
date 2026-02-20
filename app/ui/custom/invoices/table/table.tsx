"use client"

import {InvoiceTableProps} from "@/app/models/ui/invoiceTableProps";
import {ApiContext} from "@/app/lib/devOverlay/apiContext";
import {useContext, useEffect, useState} from "react";
import {PageResponse} from "@/app/models/page/pageResponse";
import {InvoiceRead} from "@/app/models/invoice/invoiceRead";
import {getFilteredInvoices} from "@/app/lib/dataAccess/invoicesClient";
import {usePermissions} from "@/app/lib/permission/permissionsClient";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/app/ui/base/table";
import {Avatar, AvatarFallback, AvatarImage} from "@/app/ui/base/avatar";
import InvoiceStatus from "@/app/ui/custom/invoices/status";
import {DeleteInvoice, UpdateInvoice} from "@/app/ui/custom/invoices/buttons";
import {InvoiceSkeleton} from "@/app/ui/custom/skeletons/invoiceSkeleton";
import {useDebugTranslations} from "@/app/lib/i18n/useDebugTranslations";
import {useSearchParams} from "next/navigation";
import {formatCurrency, formatDateToLocal} from "@/app/lib/utils";
import {useLocale} from "next-intl";

export default function InvoicesTable (props : InvoiceTableProps) {
    const t = useDebugTranslations("dashboard.controls.invoiceTable");
    const searchParams = useSearchParams();
    const locale : string = useLocale();

    const query = searchParams.get('query') ?? '';
    const currentPage = Number(searchParams.get('page')) || 1;

    const {dashboardApiIsLocal, isReady: apiContextReady} = useContext(ApiContext);
    const {hasGrant, isLoading, getAuthToken} = usePermissions();

    const [invoices, setInvoices] = useState<PageResponse<InvoiceRead> | null>(null);
    const [_isLoading, setLoading] = useState(true);

    useEffect(() => {

        if (!apiContextReady || isLoading || !getAuthToken) {
            return;
        }

        async function loadData() {
            setLoading(true);
            try {
                let inv : PageResponse<InvoiceRead> | null = null;
                if (query) {
                    inv = await getFilteredInvoices(dashboardApiIsLocal, getAuthToken, query, currentPage);
                } else {
                    inv = await getFilteredInvoices(dashboardApiIsLocal, getAuthToken, '', currentPage);
                }
                setInvoices(inv);
                console.log("Loaded data: ", {inv});
            } catch (error){
                console.error("Error loading data: ", error);
                // Set invoices to empty array or null to show error state
                setInvoices(null);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [query, currentPage, apiContextReady, dashboardApiIsLocal, isLoading, getAuthToken]);

    // Loading state
    if (isLoading  || _isLoading) {
        return (
            <InvoiceSkeleton skeletonProps={ {showShimmer : true}} />
        );
    }

    // Empty state
    if (!invoices || invoices.data.length === 0) {
        return (
            <div className="mt-6 rounded-lg border">
                <div className="flex justify-center items-center py-12">
                    <p className="text-muted-foreground">
                        {query ? `${t('noInvoicesQuery')} "${query}"` : `${t('noInvoices')}`}
                    </p>
                </div>
            </div>
        );
    }

    // Data table
    return (
        <div className="mt-6 rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t('invoiceNr')}</TableHead>
                        <TableHead>{t('customer')}</TableHead>
                        <TableHead>{t('email')}</TableHead>
                        <TableHead>{t('amount')}</TableHead>
                        <TableHead>{t('date')}</TableHead>
                        <TableHead>{t('status')}</TableHead>
                        <TableHead>{t('actions')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invoices.data.map((invoice: InvoiceRead) => (
                        <TableRow key={invoice.id}>
                            <TableCell className="font-medium">{invoice.id}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    {invoice.customer && (
                                        <Avatar className="h-7 w-7">
                                            <AvatarImage
                                                src={invoice.customer.image_url}
                                                alt={`${invoice.customer.name}`}
                                            />
                                            <AvatarFallback>
                                                {invoice.customer.name?.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                    )}
                                    <span>{invoice.customer?.name}</span>
                                </div>
                            </TableCell>
                            <TableCell>{invoice.customer?.email}</TableCell>
                            <TableCell>{formatCurrency(invoice.amount, locale)}</TableCell>
                            <TableCell>{formatDateToLocal(invoice.date, locale)}</TableCell>
                            <TableCell>
                                <InvoiceStatus status={invoice.status} />
                            </TableCell>
                            <TableCell>
                                <div className="flex justify-end gap-2">
                                    {props.canEdit && <UpdateInvoice invoiceId={invoice.id} />}
                                    {props.canDelete && <DeleteInvoice invoiceId={invoice.id} />}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}