import {CardSkeleton} from "@/app/ui/custom/skeletons/cardSkeleton";
import {SkeletonProps} from "@/app/models/ui/skeletonProps";

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