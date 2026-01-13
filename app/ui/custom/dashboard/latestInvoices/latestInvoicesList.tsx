import {LatestInvoicesProps} from "@/app/models/ui/latestInvoicesProps";
import {clsx} from "clsx";
import {RefreshCcw} from "lucide-react";
import {Avatar, AvatarImage, AvatarFallback} from "@/app/ui/base/avatar";

export default function LatestInvoicesList(latestInvoicesProps : LatestInvoicesProps) {
    if (latestInvoicesProps.invoices) {
        return (
            <div className="flex w-full flex-col md:col-span-4">
                <h2 className={"mb-4 text-xl md:text-2xl"}>
                    Latest Invoices
                </h2>
                <div className="flex grow flex-col justify-between rounded-xl bg-gray-50 p-4">
                    {/* NOTE: Uncomment this code in Chapter 7 */}
                    <div className="bg-white px-6">
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
                                            <p className="hidden text-sm text-gray-500 sm:block">
                                                <Avatar size="sm" className="mr-2">
                                                    <AvatarImage
                                                        src={invoice.customer.image_url}
                                                        alt={invoice.customer.name}
                                                    />
                                                    <AvatarFallback>{invoice
                                                        .customer?.name
                                                        .split(' ')
                                                        .map(word => word[0])
                                                        .join('')
                                                        .toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                            </p>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold md:text-base">
                                                    {invoice.customer.name}
                                                </p>
                                                <p className="hidden text-sm text-gray-500 sm:block">
                                                    {invoice.customer.email}
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>
                                <p className={`truncate text-sm font-medium md:text-base`}>
                                    $ {invoice.amount}
                                </p>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center pb-2 pt-6">
                        <RefreshCcw />
                        <h3 className="ml-2 text-sm text-gray-500 ">Updated just now</h3>
                    </div>
                </div>
            </div>
);
    }
}