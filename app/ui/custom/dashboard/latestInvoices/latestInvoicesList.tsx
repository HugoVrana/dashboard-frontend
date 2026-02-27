import {LatestInvoicesProps} from "@/app/models/ui/latestInvoicesProps";
import {clsx} from "clsx";
import {RefreshCcw} from "lucide-react";
import {Avatar, AvatarFallback, AvatarImage} from "@/app/ui/base/avatar";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/app/ui/base/card";
import {Label} from "@/app/ui/base/label";
import {useDebugTranslations} from "@/app/lib/i18n/useDebugTranslations";

export default function LatestInvoicesList(latestInvoicesProps: LatestInvoicesProps) {

    const t = useDebugTranslations("dashboard.controls.latestInvoices");

    if (latestInvoicesProps.invoices) {
        return (
            <Card className="md:col-span-4">
                <CardHeader>
                    <CardTitle>{t('title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="px-6">
                        {latestInvoicesProps.invoices.map((invoice, i) => (
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
                                            <Avatar size="sm" className="hidden sm:flex">
                                                <AvatarImage
                                                    src={invoice.customer.image_url}
                                                    alt={invoice.customer.name}
                                                />
                                                <AvatarFallback>
                                                    <Label>
                                                        {invoice.customer?.name
                                                            .split(' ')
                                                            .map(word => word[0])
                                                            .join('')
                                                            .toUpperCase()}
                                                    </Label>

                                                </AvatarFallback>
                                            </Avatar>
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
}