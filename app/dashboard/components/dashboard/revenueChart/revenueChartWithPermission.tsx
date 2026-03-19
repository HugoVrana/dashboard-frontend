"use client"

import {RevenueChartProps} from "@/app/dashboard/models/revenueChartProps";
import {RevenueChartSkeleton} from "@/app/dashboard/components/skeletons/revenueChartSkeleton";
import RevenueChart from "@/app/dashboard/components/dashboard/revenueChart/revenueChart";

export default function RevenueChartWithPermission(chartProps : RevenueChartProps) {
    if (!chartProps.hasPermission) {
        return <RevenueChartSkeleton skeletonProps={{showShimmer : false}} />
    }

    if (chartProps.revenue === undefined || chartProps.revenue === null) {
        return <RevenueChartSkeleton skeletonProps={{showShimmer : false}} />
    }

    return <RevenueChart />
}