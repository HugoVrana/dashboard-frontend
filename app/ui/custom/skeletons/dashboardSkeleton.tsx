import {RevenueChartSkeleton} from "@/app/ui/custom/skeletons/revenueChartSkeleton";
import {LatestInvoicesSkeleton} from "@/app/ui/custom/skeletons/latestInvoiceSkeleton";
import "@/app/ui/custom/skeletons/shimmer.css";
import {SkeletonProps} from "@/app/models/ui/skeletonProps";
import {CardsSkeleton} from "@/app/ui/custom/skeletons/cardsSkeleton";

export default function DashboardSkeleton({skeletonProps} : {skeletonProps : SkeletonProps}) {
    return (
        <>
            <div
                className={`shimmer relative mb-4 h-8 w-36 overflow-hidden rounded-md bg-gray-100`}
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <CardsSkeleton skeletonProps={skeletonProps} />
            </div>
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
                <RevenueChartSkeleton skeletonProps={skeletonProps} />
                <LatestInvoicesSkeleton skeletonProps={skeletonProps} />
            </div>
        </>
    );
}