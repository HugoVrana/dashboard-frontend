"use client";

import Link from "next/link";
import {useActionState, useContext, useEffect, useState} from "react";
import { CheckIcon, ClockIcon, DollarSign, FileText, Users } from "lucide-react";
import { InvoiceRead } from "@/app/models/invoice/invoiceRead";
import { CustomerRead } from "@/app/models/customer/customerRead";
import { useDebugTranslations } from "@/app/lib/i18n/useDebugTranslations";
import { useLocale } from "next-intl";
import { formatDateToLocal } from "@/app/lib/utils";
import { ApiContext } from "@/app/lib/devOverlay/apiContext";
import { usePermissions } from "@/app/lib/permission/permissionsClient";
import { getCustomers } from "@/app/lib/dataAccess/customersClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/ui/base/card";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/app/ui/base/input-group";
import { Button } from "@/app/ui/base/button";
import { Badge } from "@/app/ui/base/badge";
import { FieldSet, FieldLabel, Field } from "@/app/ui/base/field";
import { CustomerDropdown } from "@/app/ui/custom/customer/customerDropDown";
import { Skeleton } from "@/app/ui/base/skeleton";
import {State} from "@/app/models/state";
import {getDashboardLocalUrl, getDashboardRenderUrl} from "@/app/lib/devOverlay/dashboardApiContext";
import {updateInvoice} from "@/app/lib/actions";

export default function InvoiceEditForm({ invoice }: { invoice: InvoiceRead }) {
    const t = useDebugTranslations("dashboard.controls.invoice.views.editForm");
    const locale = useLocale();

    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const { dashboardApiIsLocal, isReady: apiContextReady } = useContext(ApiContext);
    const {hasGrant, isLoading, getAuthToken} = usePermissions();

    const [customers, setCustomers] = useState<CustomerRead[]>([]);
    const [customersLoading, setCustomersLoading] = useState(true);
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>(invoice.customer?.id ?? "");
    const [amount, setAmount] = useState<number>(invoice.amount);
    const [selectedStatus, setSelectedStatus] = useState<string>(invoice.status);
    const [pageState, setPageState] = useState<"idle" | "success" | "error">("idle");

    const initialState: State = {message: '', errors: {}};
    const url: string = dashboardApiIsLocal ? getDashboardLocalUrl() : getDashboardRenderUrl();
    const updateInvoiceWithUrl : (prevState : State, formData : FormData) => Promise<State> = updateInvoice.bind(null, url);
    const [errorMessage, formAction, isPending] = useActionState(updateInvoiceWithUrl, initialState);

    const [_isLoading, setLoading] = useState(true);
    const [_isPending, setPending] = useState(false);

    useEffect(() => {
        if (!apiContextReady || isLoading || !getAuthToken) {
            return;
        }

        async function loadCustomers() {
            setCustomersLoading(true);
            try {
                const data = await getCustomers(dashboardApiIsLocal, getAuthToken);
                if (data) {
                    setCustomers(data);
                }
            } catch (e) {
                console.error("Failed to load customers:", e);
            } finally {
                setCustomersLoading(false);
            }
        }

        loadCustomers();
    }, [apiContextReady, isLoading, getAuthToken, dashboardApiIsLocal]);

    return (
        <div className="space-y-6">
            {/* Header Card */}
            <Card>
                <CardHeader className="border-b">
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
                </CardHeader>
            </Card>

            {/* Status Messages */}
            {pageState === "success" && (
                <Card className="border-green-500 bg-green-50 dark:bg-green-950/20">
                    <CardContent className="pt-4">
                        <p className="text-sm text-green-700 dark:text-green-400">
                            {t("successMessage")}
                        </p>
                    </CardContent>
                </Card>
            )}

            {pageState === "error" && (
                <Card className="border-destructive bg-destructive/10">
                    <CardContent className="pt-4">
                        <p className="text-sm text-destructive">
                            {t("errorMessage")}
                        </p>
                    </CardContent>
                </Card>
            )}

            <form action={formAction}>
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Customer Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base font-medium text-muted-foreground">
                                <Users className="h-4 w-4" />
                                {t("customer")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {customersLoading ? (
                                <Skeleton className="h-10 w-full" />
                            ) : (
                                <>
                                    <input type="hidden" name="customer_id" value={selectedCustomerId} />
                                    <CustomerDropdown
                                        customers={customers}
                                        value={selectedCustomerId}
                                        onValueChange={setSelectedCustomerId}
                                    />
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Amount Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base font-medium text-muted-foreground">
                                <DollarSign className="h-4 w-4" />
                                {t("amount")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Field>
                                <InputGroup>
                                    <InputGroupAddon align="inline-start">
                                        <DollarSign className="size-4 text-muted-foreground" />
                                    </InputGroupAddon>
                                    <InputGroupInput
                                        id="amount"
                                        name="amount"
                                        type="number"
                                        step="0.01"
                                        placeholder={t("amountPlaceholder")}
                                        value={amount}
                                        onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                                        className="text-lg font-semibold"
                                        required
                                    />
                                </InputGroup>
                            </Field>
                        </CardContent>
                    </Card>
                </div>

                {/* Status Card */}
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle className="text-base font-medium text-muted-foreground">
                            {t("status")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FieldSet>
                            <div className="flex gap-4">
                                <FieldLabel className="cursor-pointer">
                                    <input
                                        id="pending"
                                        name="status"
                                        type="radio"
                                        value="pending"
                                        className="sr-only peer"
                                        checked={selectedStatus === "pending"}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                    />
                                    <Badge
                                        variant={selectedStatus === "pending" ? "default" : "outline"}
                                        className="cursor-pointer px-4 py-2 text-sm transition-all peer-focus-visible:ring-2 peer-focus-visible:ring-ring hover:bg-primary/10"
                                    >
                                        <ClockIcon className="mr-2 size-4" />
                                        {t("pending")}
                                    </Badge>
                                </FieldLabel>
                                <FieldLabel className="cursor-pointer">
                                    <input
                                        id="paid"
                                        name="status"
                                        type="radio"
                                        value="paid"
                                        className="sr-only peer"
                                        checked={selectedStatus === "paid"}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                    />
                                    <Badge
                                        variant={selectedStatus === "paid" ? "default" : "outline"}
                                        className="cursor-pointer px-4 py-2 text-sm transition-all peer-focus-visible:ring-2 peer-focus-visible:ring-ring hover:bg-primary/10"
                                    >
                                        <CheckIcon className="mr-2 size-4" />
                                        {t("paid")}
                                    </Badge>
                                </FieldLabel>
                            </div>
                        </FieldSet>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="mt-6 flex justify-end gap-4">
                    <Link
                        href="/dashboard/invoices"
                        className="flex h-10 items-center rounded-lg border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"
                    >
                        {t("cancel")}
                    </Link>
                    <Button type="submit" disabled={isPending} size="lg">
                        {isPending ? t("saving") : t("saveChanges")}
                    </Button>
                </div>
            </form>
        </div>
    );
}
