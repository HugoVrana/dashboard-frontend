import {InvoiceRead} from "@/app/dashboard/models/invoiceRead";
import {SkeletonProps} from "@/app/dashboard/models/skeletonProps";

export type LatestInvoicesProps = {
    hasPermission : boolean;
    invoices : InvoiceRead[];
    skeletonProps : SkeletonProps;
}