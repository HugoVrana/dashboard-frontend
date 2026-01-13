import {RevenueRead} from "@/app/models/revenue/revenueRead";
import {SkeletonProps} from "@/app/models/ui/skeletonProps";

export type RevenueChartProps = {
    hasPermission : boolean;
    revenue: RevenueRead[];
    skeletonProps : SkeletonProps;
}