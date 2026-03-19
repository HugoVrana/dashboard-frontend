import {InvoicesTableSkeleton} from "@/app/dashboard/components/skeletons/invoicesTableSkeleton";

export default function Loading () {
    return <InvoicesTableSkeleton skeletonProps={{showShimmer : true}} />
}