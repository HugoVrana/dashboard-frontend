import "@/app/ui/skeletons/shimmer.css";
import {SkeletonProps} from "@/app/models/ui/skeletonProps";
import {InvoicesMobileSkeleton} from "@/app/ui/skeletons/invoicesMobileSkeleton";
import {TableRowSkeleton} from "@/app/ui/skeletons/tableRowSkeleton";

export function InvoicesTableSkeleton({skeletonProps} : {skeletonProps : SkeletonProps}) {
    return (
        <div className={`${skeletonProps.showShimmer ? 'shimmer' : ''} mt-6 flow-root`}>
            <div className="inline-block min-w-full align-middle">
                <div className="rounded-lg bg-muted p-2 md:pt-0">
                    <div className="md:hidden">
                        <InvoicesMobileSkeleton skeletonProps={skeletonProps} />
                        <InvoicesMobileSkeleton skeletonProps={skeletonProps} />
                        <InvoicesMobileSkeleton skeletonProps={skeletonProps} />
                        <InvoicesMobileSkeleton skeletonProps={skeletonProps} />
                        <InvoicesMobileSkeleton skeletonProps={skeletonProps} />
                        <InvoicesMobileSkeleton skeletonProps={skeletonProps} />
                    </div>
                    <table className="hidden min-w-full text-foreground md:table">
                        <thead className="rounded-lg text-left text-sm font-normal">
                        <tr>
                            <th scope="col" className="px-3 py-5 font-medium">
                                Invoice #
                            </th>
                            <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                                Customer
                            </th>
                            <th scope="col" className="px-3 py-5 font-medium">
                                Email
                            </th>
                            <th scope="col" className="px-3 py-5 font-medium">
                                Amount
                            </th>
                            <th scope="col" className="px-3 py-5 font-medium">
                                Date
                            </th>
                            <th scope="col" className="px-3 py-5 font-medium">
                                Status
                            </th>
                            <th
                                scope="col"
                                className="relative pb-4 pl-3 pr-6 pt-2 sm:pr-6"
                            >
                                <span className="sr-only">Edit</span>
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-card">
                            <TableRowSkeleton skeletonProps={skeletonProps} />
                            <TableRowSkeleton skeletonProps={skeletonProps} />
                            <TableRowSkeleton skeletonProps={skeletonProps} />
                            <TableRowSkeleton skeletonProps={skeletonProps} />
                            <TableRowSkeleton skeletonProps={skeletonProps} />
                            <TableRowSkeleton skeletonProps={skeletonProps} />
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}