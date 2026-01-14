"use client"

import {useDebugTranslations} from "@/app/lib/devOverlay/useDebugTranslations";
import {InvoicesPageProps} from "@/app/models/ui/invoicesPageProps";
import {Suspense, use, useState} from "react";
import {InvoicesTableSkeleton} from "@/app/ui/custom/skeletons/invoicesTableSkeleton";
import Search from "@/app/ui/custom/invoices/search";
import {CreateInvoice} from "@/app/ui/custom/invoices/buttons";
import Table from "@/app/ui/custom/invoices/table";
import InvoicesPagination from "@/app/ui/custom/invoices/pagination";

export default function Page(props : InvoicesPageProps) {
    const t = useDebugTranslations("dashboard.invoices");

    const [totalPages, setTotalPages] = useState(0);

    const handlePageInfoChange = (totalPages : number) => {
        setTotalPages(totalPages);
    }

    // Use React's 'use' hook to unwrap the Promise
    const query : string = props.query || "";
    const page : number = props.page || 1;

    return (
        <div className={"w-full"}>
            <div className={"flex w-full items-center justify-between"}>
                <h1 className={`text-2xl`}>Invoices</h1>
            </div>
            <div className={"mt-4 flex items-center justify-between gap-2 md:mt-8"}>
                <Search placeholder={"Search invoices (InvoiceRead id and status are working)"}/>
                <CreateInvoice/>
            </div>
            <Suspense fallback={<InvoicesTableSkeleton skeletonProps={{showShimmer : true}} />}>
                <Table query={query} currentPage={page} onPageInfoChange={handlePageInfoChange} />
            </Suspense>
            <div className={"mt-5 flex w-full justify-center"}>
                <InvoicesPagination totalPages={totalPages} />
            </div>
        </div>
    )
}