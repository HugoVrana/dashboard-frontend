import DashboardSkeleton from "@/app/dashboard/components/skeletons/dashboardSkeleton";

export default function Loading() {
    return <DashboardSkeleton skeletonProps={{showShimmer : true}} />;
}