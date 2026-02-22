"use client"

import {use, useContext, useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {useDebugTranslations} from "@/app/lib/i18n/useDebugTranslations";
import {ApiContext} from "@/app/lib/devOverlay/apiContext";
import {usePermissions} from "@/app/lib/permission/permissionsClient";
import {InvoiceRead} from "@/app/models/invoice/invoiceRead";
import {getInvoice} from "@/app/lib/dataAccess/invoicesClient";
import {Card, CardContent} from "@/app/ui/base/card";
import { Button } from "@/app/ui/base/button";
import {AlertCircle, ArrowLeft} from "lucide-react";
import DetailSkeleton from "@/app/ui/custom/invoices/detailSkeleton";
import InvoiceEditForm from "@/app/ui/custom/invoices/views/invoiceEditForm";

export default function Page(props: { params: Promise<{ id: string }> }) {
    console.log("edit page");
    const params = use(props.params);
    console.log(params.id);
    const router = useRouter();
    const t = useDebugTranslations("dashboard.controls.invoiceDetail");

    const { dashboardApiIsLocal, isReady: apiContextReady } = useContext(ApiContext);
    const { isLoading: permissionsLoading, getAuthToken } = usePermissions();

    const [invoice, setinvoice] = useState<InvoiceRead | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        console.log("[InvoiceDetailPage] useEffect triggered", {
            apiContextReady,
            permissionsLoading,
            hasAuthToken: !!getAuthToken,
            paramsId: params.id
        });

        if (!apiContextReady || permissionsLoading || !getAuthToken) {
            console.log("[InvoiceDetailPage] Early return - conditions not met");
            return;
        }

        async function loadInvoice() {
            console.log("[InvoiceDetailPage] loadInvoice called for id:", params.id);
            setIsLoading(true);
            setError(null);
            try {
                const data = await getInvoice(dashboardApiIsLocal, getAuthToken, params.id);
                if (data) {
                    setinvoice(data);
                    console.log("invoice found")
                } else {
                    setError("Invoice not found");
                }
            } catch (e) {
                console.error("Error loading invoice:", e);
                setError("Failed to load invoice");
            } finally {
                setIsLoading(false);
            }
        }

        loadInvoice();
    }, [params.id, apiContextReady, dashboardApiIsLocal, permissionsLoading, getAuthToken]);


    // Loading state
    if (permissionsLoading || isLoading) {
        <DetailSkeleton/>
    }

    // Error state
    if (error || !invoice) {
        return (
            <div className="space-y-6">
                <Button
                    variant="ghost"
                    onClick={() => router.push("/dashboard/invoices")}
                    className="gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    {t("backToInvoices")}
                </Button>
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-lg font-medium text-muted-foreground">
                            {error ?? "Invoice not found"}
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Button
                variant="ghost"
                onClick={() => router.push("/dashboard/invoices")}
                className="gap-2"
            >
                <ArrowLeft className="h-4 w-4" />
                {t("backToInvoices")}
            </Button>
            <InvoiceEditForm invoice={invoice} />
        </div>
    );
}