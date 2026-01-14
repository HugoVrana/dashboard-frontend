"use client"

import { useEffect, useContext, useState } from "react";
import { InvoiceRead } from '@/app/models/invoice/invoiceRead';
import { PageResponse } from "@/app/models/page/pageResponse";
import {ApiContext} from "@/app/lib/devOverlay/apiContext";
import {getFilteredInvoices} from "@/app/lib/dataAccess/invoicesClient";
import {Card, CardContent} from "@/app/ui/base/card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/app/ui/base/table";
import {Avatar, AvatarFallback, AvatarImage} from "@/app/ui/base/avatar";
import {DeleteInvoice, UpdateInvoice} from "@/app/ui/custom/invoices/buttons";
import InvoiceStatus from "@/app/ui/custom/invoices/status";
import {formatCurrency, formatDateToLocal} from "@/app/lib/utils";

export default ({
                    query,
                    currentPage,
                    onPageInfoChange
                }: {
    query: string;
    currentPage: number;
    onPageInfoChange?: (totalPages: number) => void;
}) => {
    console.log(query);
    console.log("Table query : ", query);
    console.log("Current page : ", currentPage);

    const { dashboardApiIsLocal, isReady: apiContextReady } = useContext(ApiContext);
    const [invoices, setInvoices] = useState<PageResponse<InvoiceRead> | null>(null);
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        async function loadInvoices() {
            setLoading(true);
            try {
                const invoices: PageResponse<InvoiceRead> | null = await getFilteredInvoices(
                    dashboardApiIsLocal.valueOf(),
                    query,
                    currentPage
                );
                setInvoices(invoices);

                if (invoices && onPageInfoChange) {
                    onPageInfoChange(invoices.totalPages);
                }

                console.log("Loaded data: ", { invoices });
            } catch (error) {
                console.error("Error loading data: ", error);
                setInvoices(null);
            } finally {
                setLoading(false);
            }
        }

        loadInvoices();
    }, [query, currentPage, dashboardApiIsLocal, onPageInfoChange]);

    // Loading state
    if (isLoading) {
        return (
            <div className="mt-6">
                <Card>
                    <CardContent className="flex justify-center items-center py-8">
                        <div className="text-muted-foreground">Loading invoices...</div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Error state
    if (!isLoading && (!invoices || invoices.data.length === 0)) {
        return (
            <div className="mt-6">
                <Card>
                    <CardContent className="flex justify-center items-center py-8">
                        <div className="text-muted-foreground">
                            {query ? `No invoices found for "${query}"` : 'No invoices found'}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="mt-6">
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice #</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">
                                    <span className="sr-only">Actions</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices?.data.map((invoice: InvoiceRead) => (
                                <TableRow key={invoice.id}>
                                    <TableCell className="font-medium">{invoice.id}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {invoice.customer && (
                                                <Avatar className="h-7 w-7">
                                                    <AvatarImage
                                                        src={invoice.customer.image_url}
                                                        alt={`${invoice.customer.name}'s profile picture`}
                                                    />
                                                    <AvatarFallback>
                                                        {invoice.customer.name.substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                            )}
                                            <span>{invoice.customer?.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{invoice.customer?.email}</TableCell>
                                    <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                                    <TableCell>{formatDateToLocal(invoice.date)}</TableCell>
                                    <TableCell>
                                        <InvoiceStatus status={invoice.status} />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <UpdateInvoice invoiceId={invoice.id} />
                                            <DeleteInvoice invoiceId={invoice.id} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}