import "@/app/dashboard/components/skeletons/shimmer.css";
import {SkeletonProps} from "@/app/dashboard/models/skeletonProps";
import {CardsSkeleton} from "@/app/dashboard/components/skeletons/cardsSkeleton";
import {RevenueChartSkeleton} from "@/app/dashboard/components/skeletons/revenueChartSkeleton";
import {LatestInvoicesSkeleton} from "@/app/dashboard/components/skeletons/latestInvoiceSkeleton";

export default function DashboardSkeleton({skeletonProps} : {skeletonProps : SkeletonProps}) {
    return (
        <>
            <div
                className={`shimmer relative mb-4 h-8 w-36 overflow-hidden rounded-md bg-muted`}
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