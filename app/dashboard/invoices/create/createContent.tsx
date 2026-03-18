"use client"

import CreateInvoiceForm from "@/app/dashboard/components/invoices/views/createForm";
import {usePermissions} from "@/app/auth/permission/permissionsClient";

export default function CreateContent(){
    const { hasGrant } = usePermissions();
    const canViewCustomers : boolean = hasGrant("dashboard-customers-read");

    return (
        <main>
            <CreateInvoiceForm customerReadPermission={canViewCustomers} />
        </main>
    )
}
