import {RevenueRead} from "@/app/dashboard/models/revenueRead";
import {SkeletonProps} from "@/app/dashboard/models/skeletonProps";

export type RevenueChartProps = {
    hasPermission : boolean;
    revenue: RevenueRead[];
    skeletonProps : SkeletonProps;
}