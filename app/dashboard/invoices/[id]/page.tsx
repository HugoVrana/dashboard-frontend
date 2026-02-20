"use client";

import { use, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiContext } from "@/app/lib/devOverlay/apiContext";
import { usePermissions } from "@/app/lib/permission/permissionsClient";
import { getInvoice } from "@/app/lib/dataAccess/invoicesClient";
import { InvoiceRead } from "@/app/models/invoice/invoiceRead";
import InvoiceDetail from "@/app/ui/custom/invoices/detail/InvoiceDetail";
import { Button } from "@/app/ui/base/button";
import { Skeleton } from "@/app/ui/base/skeleton";
import { Card, CardContent } from "@/app/ui/base/card";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { useDebugTranslations } from "@/app/lib/i18n/useDebugTranslations";

export default function Page(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params);
    const router = useRouter();
    const t = useDebugTranslations("dashboard.controls.invoiceDetail");

    const { dashboardApiIsLocal, isReady: apiContextReady } = useContext(ApiContext);
    const { isLoading: permissionsLoading, getAuthToken } = usePermissions();

    const [invoice, setInvoice] = useState<InvoiceRead | null>(null);
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
                    setInvoice(data);
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
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-32" />
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-12 w-12 rounded-lg" />
                            <div className="space-y-2">
                                <Skeleton className="h-6 w-48" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardContent className="p-6">
                            <Skeleton className="h-4 w-24 mb-4" />
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-16 w-16 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-36" />
                                    <Skeleton className="h-4 w-48" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <Skeleton className="h-4 w-32 mb-4" />
                            <Skeleton className="h-8 w-28 mb-4" />
                            <div className="grid grid-cols-2 gap-4">
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
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
            <InvoiceDetail invoice={invoice} />
        </div>
    );
}