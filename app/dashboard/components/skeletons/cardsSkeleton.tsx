import {SkeletonProps} from "@/app/dashboard/models/skeletonProps";
import {CardSkeleton} from "@/app/dashboard/components/skeletons/cardSkeleton";

export function CardsSkeleton({skeletonProps} : {skeletonProps : SkeletonProps}) {
    return (
        <>
            <CardSkeleton skeletonProps={skeletonProps}/>
            <CardSkeleton skeletonProps={skeletonProps}/>
            <CardSkeleton skeletonProps={skeletonProps}/>
            <CardSkeleton skeletonProps={skeletonProps}/>
        </>
    );
}