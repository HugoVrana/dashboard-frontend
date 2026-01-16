import {InvoicesTableSkeleton} from "@/app/ui/custom/skeletons/invoicesTableSkeleton";

export default function Loading () {
    return <InvoicesTableSkeleton skeletonProps={{showShimmer : true}} />
}