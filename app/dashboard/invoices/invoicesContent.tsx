"use client"

import {useDebugTranslations} from "@/app/lib/i18n/useDebugTranslations";
import {useEffect, useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import Search from "@/app/ui/custom/invoices/search";
import {CreateInvoice} from "@/app/ui/custom/invoices/buttons";
import {usePermissions} from "@/app/lib/permission/permissionsClient";
import TableWithPermission from "@/app/ui/custom/invoices/table/tableWithPermission";
import {Card, CardContent} from "@/app/ui/base/card";
import {CheckCircle, X} from "lucide-react";

export default function InvoicesContent() {
    const t = useDebugTranslations("dashboard.invoices");
    const { hasGrant } = usePermissions();
    const searchParams = useSearchParams();
    const router = useRouter();

    const [showBanner, setShowBanner] = useState<string | null>(null);

    const canViewInvoices : boolean = hasGrant("dashboard-invoices-read");
    const canCreateInvoices : boolean = hasGrant("dashboard-invoices-create");
    const canViewCustomers : boolean = hasGrant("dashboard-customers-read");
    const canViewCreateButton : boolean = canViewInvoices && canCreateInvoices && canViewCustomers;

    useEffect(() => {
        if (searchParams.get('created') === 'true') {
            setShowBanner('created');
            router.replace('/dashboard/invoices', { scroll: false });
        } else if (searchParams.get('updated') === 'true') {
            setShowBanner('updated');
            router.replace('/dashboard/invoices', { scroll: false });
        } else if (searchParams.get('deleted') === 'true') {
            setShowBanner('deleted');
            router.replace('/dashboard/invoices', { scroll: false });
        }
    }, [searchParams, router]);

    useEffect(() => {
        if (showBanner) {
            const timer = setTimeout(() => setShowBanner(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [showBanner]);

    const getBannerMessage = () => {
        switch (showBanner) {
            case 'created':
            case 'updated':
            case 'deleted':
                return t(`actions.${showBanner}`)
            default: return '';
        }
    };

    return (
        <main className={"p-6 pt-10"}>
            {showBanner && (
                <Card className="mb-4 border-green-500 bg-green-50 dark:bg-green-950/20">
                    <CardContent className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="size-5 text-green-600 dark:text-green-400" />
                            <p className="text-sm text-green-700 dark:text-green-400">
                                {getBannerMessage()}
                            </p>
                        </div>
                        <button
                            onClick={() => setShowBanner(null)}
                            className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
                        >
                            <X className="size-4" />
                        </button>
                    </CardContent>
                </Card>
            )}
            <h1>
                {t("title")}
            </h1>
            <div className="flex gap-6 items-center">
                {(canViewInvoices && (
                    <Search placeholder={t("searchPlaceholder")}/>
                ))}

                {(canViewCreateButton && (
                    <CreateInvoice/>
                ))}
            </div>
            <TableWithPermission />
        </main>
    )
}
