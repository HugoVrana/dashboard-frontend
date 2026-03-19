import {CardProps} from "@/app/dashboard/models/cardProps";
import {CardSkeleton} from "@/app/dashboard/components/skeletons/cardSkeleton";
import {DashboardCard} from "@/app/dashboard/components/dashboard/cards/card";

export default function CardWithPermission(cardProps : CardProps) {
    if (!cardProps.hasPermission) {
        return <CardSkeleton skeletonProps={{showShimmer : false}}/>
    }

    if (cardProps.value === undefined || cardProps.value === null) {
        return <CardSkeleton skeletonProps={{showShimmer : false}} />
    }

    return <DashboardCard {...cardProps} />
}