"use client"

import {RevenueChartProps} from "@/app/models/ui/revenueChartProps";
import {RevenueChartSkeleton} from "@/app/ui/skeletons/revenueChartSkeleton";
import RevenueChart from "@/app/ui/dashboard/revenueChart/revenueChart";

export default function RevenueChartWithPermission(chartProps : RevenueChartProps) {
    if (!chartProps.hasPermission) {
        return <RevenueChartSkeleton skeletonProps={{showShimmer : false}} />
    }

    if (chartProps.revenue === undefined || chartProps.revenue === null) {
        return <RevenueChartSkeleton skeletonProps={{showShimmer : false}} />
    }

    return <RevenueChart />
}