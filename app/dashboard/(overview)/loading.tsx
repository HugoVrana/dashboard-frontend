import DashboardSkeleton from "@/app/ui/skeletons/dashboardSkeleton";

export default function Loading() {
    return <DashboardSkeleton skeletonProps={{showShimmer : true}} />;
}