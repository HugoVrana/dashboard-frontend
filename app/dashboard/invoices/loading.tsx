import {InvoicesTableSkeleton} from "@/app/ui/skeletons/invoicesTableSkeleton";

export default function Loading () {
    return <InvoicesTableSkeleton skeletonProps={{showShimmer : true}} />
}