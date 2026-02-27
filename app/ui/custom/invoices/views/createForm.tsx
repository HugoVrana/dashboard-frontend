"use client"

import Link from 'next/link';
import {CheckIcon, ClockIcon, DollarSign} from 'lucide-react';
import {CustomerRead} from "@/app/models/customer/customerRead";
import {useActionState, useContext, useEffect, useState} from 'react';
import {ApiContext} from "@/app/lib/devOverlay/apiContext";
import {createInvoice} from "@/app/lib/actions";
import {State} from "@/app/models/state";
import {getDashboardLocalUrl, getDashboardRenderUrl} from "@/app/lib/devOverlay/dashboardApiContext";
import {Card, CardContent} from "@/app/ui/base/card";
import {Label} from "@/app/ui/base/label";
import {InputGroup, InputGroupAddon, InputGroupInput} from "@/app/ui/base/input-group";
import {Button} from "@/app/ui/base/button";
import {Badge} from "@/app/ui/base/badge";
import {CustomerDropdown} from "@/app/ui/custom/customer/customerDropDown";
import {Field, FieldLabel, FieldLegend, FieldSet} from "@/app/ui/base/field";
import {usePermissions} from "@/app/lib/permission/permissionsClient";
import {getCustomers} from "@/app/lib/dataAccess/customersClient";
import {useDebugTranslations} from "@/app/lib/i18n/useDebugTranslations";

export default function CreateInvoiceForm({customerReadPermission}: { customerReadPermission: boolean; }) {
    const t = useDebugTranslations("dashboard.controls.invoice.views.createForm");

    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const {dashboardApiIsLocal, isReady: apiContextReady} = useContext(ApiContext);
    const {hasGrant, isLoading, getAuthToken} = usePermissions();

    const [customers, setCustomer] = useState<CustomerRead[]>();
    const [pageState, setPageState] = useState("insert");
    const [selectedStatus, setSelectedStatus] = useState<string>("");
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");

    const initialState: State = {message: '', errors: {}};
    const url: string = dashboardApiIsLocal ? getDashboardLocalUrl() : getDashboardRenderUrl();
    const createInvoiceWithUrl: (prevState: State, formData: FormData) => Promise<State> = createInvoice.bind(null, url);
    const [errorMessage, formAction, isPending] = useActionState(createInvoiceWithUrl, initialState);

    const [_isLoading, setLoading] = useState(true);

    useEffect(() => {
        if (!apiContextReady || isLoading || !getAuthToken) {
            return;
        }

        async function loadData(){
            setLoading(true);
            try {
                let localCustomers : CustomerRead[] | null = await getCustomers(dashboardApiIsLocal, getAuthToken);
                if (localCustomers) {
                    setCustomer(localCustomers);
                } else {
                    console.error("Failed to load customers");
                }
            } catch (e) {
                console.error("Failed loading customers");
            }
            setLoading(false);
        }

        loadData();
    }, [apiContextReady, isLoading, getAuthToken, dashboardApiIsLocal]);

    useEffect(() => {
        if (errorMessage.message) {
            setValidationErrors(prev => [...prev, errorMessage.message as string]);
            setPageState("error");
        }
    }, [errorMessage.message]);

    useEffect(() => {
        if (errorMessage.message === '' && Object.keys(errorMessage.errors || {}).length === 0 && !isPending) {
            // Form succeeded
        }
    }, [errorMessage, isPending]);

    return (
        <div className="space-y-4">
            {validationErrors.length > 0 && (
                <Card className="border-destructive bg-destructive/10">
                    <CardContent className="pt-4">
                        <ul className="list-disc list-inside text-sm text-destructive">
                            {validationErrors.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

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
                <Card>
                    <CardContent className="space-y-6 pt-6">
                        {/* Customer Name */}
                        <Field>
                            <Label htmlFor="customer_id">{t("chooseCustomer")}</Label>
                            {customerReadPermission ? (
                                <>
                                    <input type="hidden" name="customer_id" value={selectedCustomerId}/>
                                    <CustomerDropdown
                                        customers={customers ?? []}
                                        value={selectedCustomerId}
                                        onValueChange={setSelectedCustomerId}
                                    />
                                </>
                            ) : (
                                <div className="text-sm text-muted-foreground">
                                    {t("noCustomerPermission")}
                                </div>
                            )}
                        </Field>

                        {/* Invoice Amount */}
                        <Field>
                            <Label htmlFor="amount">{t("chooseAmount")}</Label>
                            <InputGroup>
                                <InputGroupAddon align="inline-start">
                                    <DollarSign className="size-4 text-muted-foreground"/>
                                </InputGroupAddon>
                                <InputGroupInput
                                    id="amount"
                                    name="amount"
                                    type="number"
                                    step="0.01"
                                    placeholder={t("amountPlaceholder")}
                                    required
                                />
                            </InputGroup>
                        </Field>

                        {/* Invoice Status */}
                        <FieldSet>
                            <FieldLegend variant="label">{t("setStatus")}</FieldLegend>
                            <div className="flex gap-4">
                                <FieldLabel className="cursor-pointer">
                                    <input
                                        id="pending"
                                        name="status"
                                        type="radio"
                                        value="pending"
                                        className="sr-only peer"
                                        required
                                        checked={selectedStatus === "pending"}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                    />
                                    <Badge
                                        variant={selectedStatus === "pending" ? "default" : "outline"}
                                        className="cursor-pointer transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-ring"
                                    >
                                        {t("pending")} <ClockIcon className="size-3.5"/>
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
                                        className="cursor-pointer transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-ring"
                                    >
                                        {t("paid")} <CheckIcon className="size-3.5"/>
                                    </Badge>
                                </FieldLabel>
                            </div>
                        </FieldSet>
                    </CardContent>
                </Card>

                <div className="mt-6 flex justify-end gap-4">
                    <Link
                        href="/dashboard/invoices"
                        className="flex h-8 items-center rounded-lg border border-input bg-background px-2.5 text-sm font-medium transition-colors hover:bg-muted"
                    >
                        {t("cancel")}
                    </Link>
                    <Button type="submit" disabled={isPending}>
                        {isPending ? t("creating") : t("createInvoice")}
                    </Button>
                </div>
            </form>
        </div>
    );
}