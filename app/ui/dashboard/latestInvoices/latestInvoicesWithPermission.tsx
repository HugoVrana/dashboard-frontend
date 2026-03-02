import {LatestInvoicesProps} from "@/app/models/ui/latestInvoicesProps";
import {LatestInvoicesSkeleton} from "@/app/ui/skeletons/latestInvoiceSkeleton";
import LatestInvoicesList from "@/app/ui/dashboard/latestInvoices/latestInvoicesList";

export default function LatestInvoicesWithPermission(latestInvoicesProps : LatestInvoicesProps) {
    if (!latestInvoicesProps.hasPermission) {
        return <LatestInvoicesSkeleton skeletonProps={{showShimmer : false}} />
    }

    if (latestInvoicesProps.invoices === undefined || latestInvoicesProps.invoices === null) {
        return <LatestInvoicesSkeleton skeletonProps={{showShimmer : false}} />
    }
    return (<LatestInvoicesList {...latestInvoicesProps} />);
}