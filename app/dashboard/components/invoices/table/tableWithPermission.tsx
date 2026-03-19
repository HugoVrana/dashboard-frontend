"use client"

import {Suspense} from "react";
import {InvoicesTableSkeleton} from "@/app/dashboard/components/skeletons/invoicesTableSkeleton";
import InvoicesTable from "@/app/dashboard/components/invoices/table/table";
import {usePermissions} from "@/app/auth/permission/permissionsClient";

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
