import {InvoiceRead} from "@/app/models/invoice/invoiceRead";
import {SkeletonProps} from "@/app/models/ui/skeletonProps";

export type LatestInvoicesProps = {
    hasPermission : boolean;
    invoices : InvoiceRead[];
    skeletonProps : SkeletonProps;
}