"use client";

import { InvoiceRead } from "@/app/models/invoice/invoiceRead";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/ui/base/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/ui/base/avatar";
import { Separator } from "@/app/ui/base/separator";
import InvoiceStatus from "@/app/ui/custom/invoices/status";
import { formatCurrency, formatDateToLocal } from "@/app/lib/utils";
import { useDebugTranslations } from "@/app/lib/i18n/useDebugTranslations";
import { useLocale } from "next-intl";
import { FileText, Mail, Calendar, CreditCard, Hash } from "lucide-react";

interface InvoiceDetailProps {
    invoice: InvoiceRead;
}

export default function InvoiceDetail({ invoice }: InvoiceDetailProps) {
    const t = useDebugTranslations("dashboard.controls.invoiceDetail");
    const locale = useLocale();

    return (
        <div className="space-y-6">
            {/* Header Card */}
            <Card>
                <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                <FileText className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">
                                    {t("title")} #{invoice.id}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    {formatDateToLocal(invoice.date, locale)}
                                </p>
                            </div>
                        </div>
                        <InvoiceStatus status={invoice.status} />
                    </div>
                </CardHeader>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Customer Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-medium text-muted-foreground">
                            {t("customer")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage
                                    src={invoice.customer?.image_url}
                                    alt={invoice.customer?.name ?? "Customer"}
                                />
                                <AvatarFallback className="text-lg">
                                    {invoice.customer?.name?.charAt(0) ?? "?"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <p className="text-lg font-semibold">
                                    {invoice.customer?.name ?? t("unknownCustomer")}
                                </p>
                                {invoice.customer?.email && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Mail className="h-4 w-4" />
                                        <span>{invoice.customer.email}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Amount Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-medium text-muted-foreground">
                            {t("paymentDetails")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <CreditCard className="h-4 w-4" />
                                <span className="text-sm">{t("amount")}</span>
                            </div>
                            <span className="text-2xl font-bold">
                                {formatCurrency(invoice.amount, locale)}
                            </span>
                        </div>
                        <Separator />
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Hash className="h-4 w-4" />
                                    <span>{t("invoiceId")}</span>
                                </div>
                                <p className="font-medium">{invoice.id}</p>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span>{t("date")}</span>
                                </div>
                                <p className="font-medium">
                                    {formatDateToLocal(invoice.date, locale)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
