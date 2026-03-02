"use client"

import {Suspense} from "react";
import {usePermissions} from "@/app/lib/permission/permissionsClient";
import {InvoicesTableSkeleton} from "@/app/ui/skeletons/invoicesTableSkeleton";
import InvoicesTable from "@/app/ui/invoices/table/table";

export default function TableWithPermission() {
    const { hasGrant } = usePermissions();

    const hasReadGrant : boolean = hasGrant("dashboard-invoices-read");
    const canEdit : boolean = hasGrant("dashboard-invoices-update");
    const canDelete : boolean = hasGrant("dashboard-invoices-delete");

    if (!hasReadGrant) {
        return <InvoicesTableSkeleton skeletonProps={{showShimmer: false}}/>
    }
    return (
        <Suspense fallback={<InvoicesTableSkeleton skeletonProps={{showShimmer: true}} />}>
            <InvoicesTable canEdit={canEdit} canDelete={canDelete}/>
        </Suspense>
    )
}
