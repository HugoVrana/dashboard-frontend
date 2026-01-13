import DashboardSkeleton from "@/app/ui/custom/skeletons/dashboardSkeleton";

export default function Loading() {
    return <DashboardSkeleton skeletonProps={{showShimmer : true}} />;
}