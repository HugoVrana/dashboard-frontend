"use client"

import {usePermissions} from "@/app/lib/permission/permissionsClient";
import CreateInvoiceForm from "@/app/ui/custom/invoices/views/createForm";

export default function Page(){
    const { hasGrant } = usePermissions();
    const canViewCustomers : boolean = hasGrant("dashboard-customers-read");

    return (
        <main>
            <CreateInvoiceForm customerReadPermission={canViewCustomers} />
        </main>
    )
}