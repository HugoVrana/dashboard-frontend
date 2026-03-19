import {InvoiceRead} from "@/app/dashboard/models/invoiceRead";
import {clsx} from "clsx";
import {RefreshCcw} from "lucide-react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@hugovrana/dashboard-frontend-shared";
import {useDebugTranslations} from "@/app/shared/contexts/translations/useDebugTranslations";
import CustomerAvatar from "@/app/dashboard/components/customer/customerAvatar";

type Props = {
    invoices: InvoiceRead[];
}

export default function LatestInvoicesList({ invoices }: Props) {

    const t = useDebugTranslations("dashboard.controls.latestInvoices");

    console.log("LatestInvoicesList ", invoices);
    if (!invoices) return null;

    return (
        <Card className="md:col-span-4">
            <CardHeader>
                <CardTitle>{t('title')}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="px-6">
                    {invoices.map((invoice, i) => (
                        <div
                            key={invoice.id + "_" + i}
                            className={clsx(
                                'flex flex-row items-center justify-between py-4',
                                {
                                    'border-t': i !== 0,
                                },
                            )}
                        >
                            <div className="flex flex-row items-center gap-4">
                                {invoice.customer && (
                                    <>
                                        <CustomerAvatar customer={invoice.customer} size="sm" className="hidden sm:flex" />
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold md:text-base">
                                                {invoice.customer.name}
                                            </p>
                                            <p className="hidden text-sm text-muted-foreground sm:block">
                                                {invoice.customer.email}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                            <p className="truncate text-sm font-medium md:text-base">
                                $ {invoice.amount}
                            </p>
                        </div>
                    ))}
                </div>
                <CardDescription className="flex items-center gap-2 pt-4">
                    <RefreshCcw className="h-4 w-4" />
                    {t('updatedNow')}
                </CardDescription>
            </CardContent>
        </Card>
    );
}