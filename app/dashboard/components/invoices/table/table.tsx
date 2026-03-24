"use client"

import {InvoiceTableProps} from "@/app/dashboard/models/invoiceTableProps";
import {useEffect, useState} from "react";
import {PageResponse} from "@/app/shared/models/pageResponse";
import {InvoiceRead} from "@/app/dashboard/models/invoiceRead";
import {useSearchParams} from "next/navigation";
import {useLocale} from "next-intl";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@hugovrana/dashboard-frontend-shared";
import {InvoiceSkeleton} from "@/app/dashboard/components/skeletons/invoiceSkeleton";
import InvoicesPagination from "@/app/dashboard/components/invoices/pagination";
import InvoiceStatus from "@/app/dashboard/components/invoices/status";
import {DeleteInvoice, UpdateInvoice, ViewInvoice} from "@/app/dashboard/components/invoices/buttons";
import {useDebugTranslations} from "@/app/shared/contexts/translations/useDebugTranslations";
import {usePermissions} from "@/app/auth/permission/permissionsClient";
import {useInvoicesApi} from "@/app/dashboard/hooks/useInvoicesApi";
import {formatCurrency, formatDateToLocal} from "@/app/dashboard/utils";
import CustomerAvatar from "@/app/dashboard/components/customer/customerAvatar";

export default function InvoicesTable (props : InvoiceTableProps) {
    const t = useDebugTranslations("dashboard.controls.invoiceTable");
    const searchParams = useSearchParams();
    const locale : string = useLocale();

    const query = searchParams.get('query') ?? '';
    const currentPage = Number(searchParams.get('page')) || 1;

    const {isLoading} = usePermissions();
    const {getFilteredInvoices} = useInvoicesApi();

    const [invoices, setInvoices] = useState<PageResponse<InvoiceRead> | null>(null);
    const [_isLoading, setLoading] = useState(true);

    useEffect(() => {
        if (isLoading) {
            return;
        }

        async function loadData() {
            setLoading(true);
            try {
                const inv = await getFilteredInvoices(query ?? '', currentPage);
                setInvoices(inv);
                console.log("Loaded data: ", {inv});
            } catch (error){
                console.error("Error loading data: ", error);
                setInvoices(null);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [query, currentPage, isLoading, getFilteredInvoices]);

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
        <div>
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
                                            <>
                                                <CustomerAvatar customer={invoice.customer} className="h-7 w-7" />
                                                <span>{invoice.customer.name}</span>
                                            </>
                                        )}
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
                                        <ViewInvoice invoiceId={invoice.id} />
                                        {props.canEdit && <UpdateInvoice invoiceId={invoice.id} />}
                                        {props.canDelete && <DeleteInvoice invoiceId={invoice.id} />}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className={"mt-5 flex w-full justify-center"}>
                <InvoicesPagination totalPages={invoices.totalPages} />
            </div>
        </div>
    );
}