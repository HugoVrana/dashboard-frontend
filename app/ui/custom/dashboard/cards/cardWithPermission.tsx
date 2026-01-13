import {CardProps} from "@/app/models/ui/cardProps";
import {CardSkeleton} from "@/app/ui/custom/skeletons/cardSkeleton";
import {DashboardCard} from "@/app/ui/custom/dashboard/cards/card";

export default function CardWithPermission(cardProps : CardProps) {
    if (!cardProps.hasPermission) {
        return <CardSkeleton skeletonProps={{showShimmer : false}}/>
    }

    if (cardProps.value === undefined || cardProps.value === null) {
        return <CardSkeleton skeletonProps={{showShimmer : false}} />
    }

    return <DashboardCard {...cardProps} />
}