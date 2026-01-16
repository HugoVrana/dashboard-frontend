import {Suspense} from "react";
import {InvoicesTableSkeleton} from "@/app/ui/custom/skeletons/invoicesTableSkeleton";
import {hasGrant} from "@/app/lib/permission/permissionsServerClient";
import InvoicesTable from "@/app/ui/custom/invoices/table/table";

export default function TableWithPermission() {
    const hasReadGrant: boolean = hasGrant("dashboard-invoices-read");
    const props = {
        canEdit: hasGrant("dashboard-invoices-update"),
        canDelete: hasGrant("dashboard-invoices-delete")
    };

    if (!hasReadGrant) {
        return  <InvoicesTableSkeleton skeletonProps={{showShimmer : false}}/>
    }
    return (
        <Suspense fallback={<InvoicesTableSkeleton skeletonProps={{showShimmer : true }} />}>
            <InvoicesTable {...props}/>
        </Suspense>
    )
}