"use client"

import {useDebugTranslations} from "@/app/lib/devOverlay/useDebugTranslations";
import {InvoicesPageProps} from "@/app/models/ui/invoicesPageProps";
import {useState} from "react";

export default function Page(props : InvoicesPageProps) {
    const t = useDebugTranslations("dashboard.invoices");

    const [totalPages, setTotalPages] = useState(0);

    const handlePageInfoChange = (totalPages : number) => {
        setTotalPages(totalPages);
    }

    const query : string = props?.query || "";
}