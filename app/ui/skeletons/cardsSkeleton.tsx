import {SkeletonProps} from "@/app/models/ui/skeletonProps";
import {CardSkeleton} from "@/app/ui/skeletons/cardSkeleton";

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