"use client"

import {useDebugTranslations} from "@/app/lib/devOverlay/useDebugTranslations";
import {useState} from "react";
import Search from "@/app/ui/custom/invoices/search";
import {CreateInvoice} from "@/app/ui/custom/invoices/buttons";
import InvoicesPagination from "@/app/ui/custom/invoices/pagination";
import {hasGrant} from "@/app/lib/permission/permissionsServerClient";
import {InvoiceTableProps} from "@/app/models/ui/invoiceTableProps";
import TableWithPermission from "@/app/ui/custom/invoices/table/tableWithPermission";

export default function Page(props : InvoiceTableProps) {
    const t = useDebugTranslations("dashboard.invoices");

    const [totalPages, setTotalPages] = useState(0);

    const canViewInvoices : boolean = hasGrant("dashboard-invoices-read");
    const canCreateInvoices : boolean = hasGrant("dashboard-invoices-create");
    const canViewCustomers : boolean = hasGrant("dashboard-customers-read");
    const canViewCreateButton : boolean = canViewInvoices && canCreateInvoices && canViewCustomers;

    return (
        <main className={"p-6 pt-10"}>
            <h1>
                {t("title")}
            </h1>
            <div className="flex gap-6 items-center">
                {(canViewInvoices && (
                    <Search placeholder={t("searchPlaceholder")}/>
                ))}

                {(canViewCreateButton && (
                    <CreateInvoice/>
                ))}
            </div>
            <TableWithPermission />
            <div className={"mt-5 flex w-full justify-center"}>
                <InvoicesPagination totalPages={totalPages} />
            </div>
        </main>
    )
}