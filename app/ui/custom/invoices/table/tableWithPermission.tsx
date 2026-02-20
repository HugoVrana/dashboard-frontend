"use client"

import {Suspense} from "react";
import {InvoicesTableSkeleton} from "@/app/ui/custom/skeletons/invoicesTableSkeleton";
import {usePermissions} from "@/app/lib/permission/permissionsClient";
import InvoicesTable from "@/app/ui/custom/invoices/table/table";

export default function TableWithPermission() {
    const { hasGrant } = usePermissions();

    const hasReadGrant = hasGrant("dashboard-invoices-read");
    const canEdit = hasGrant("dashboard-invoices-update");
    const canDelete = hasGrant("dashboard-invoices-delete");

    if (!hasReadGrant) {
        return <InvoicesTableSkeleton skeletonProps={{showShimmer: false}}/>
    }
    return (
        <Suspense fallback={<InvoicesTableSkeleton skeletonProps={{showShimmer: true}} />}>
            <InvoicesTable canEdit={canEdit} canDelete={canDelete}/>
        </Suspense>
    )
}
