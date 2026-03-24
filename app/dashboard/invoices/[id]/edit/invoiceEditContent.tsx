"use client"

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {useDebugTranslations} from "@/app/shared/contexts/translations/useDebugTranslations";
import {usePermissions} from "@/app/auth/permission/permissionsClient";
import {InvoiceRead} from "@/app/dashboard/models/invoiceRead";
import {useInvoicesApi} from "@/app/dashboard/hooks/useInvoicesApi";
import {AlertCircle, ArrowLeft} from "lucide-react";
import {InvoiceEditContentProps} from "@/app/dashboard/models/invoiceEditContentProps";
import DetailSkeleton from "@/app/dashboard/components/invoices/detailSkeleton";
import {Button, Card} from "@hugovrana/dashboard-frontend-shared/components";
import {CardContent} from "@hugovrana/dashboard-frontend-shared";
import InvoiceEditForm from "@/app/dashboard/components/invoices/views/invoiceEditForm";

export default function InvoiceEditContent({ id }: InvoiceEditContentProps) {
    const router = useRouter();
    const t = useDebugTranslations("dashboard.controls.invoiceDetail");

    const { isLoading: permissionsLoading } = usePermissions();
    const {getInvoice} = useInvoicesApi();

    const [invoice, setinvoice] = useState<InvoiceRead | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (permissionsLoading) {
            return;
        }

        async function loadInvoice() {
            setIsLoading(true);
            setError(null);
            try {
                const data = await getInvoice(id);
                if (data) {
                    setinvoice(data);
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
    }, [id, permissionsLoading, getInvoice]);


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
