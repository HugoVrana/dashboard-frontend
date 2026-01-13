import "@/app/ui/custom/skeletons/shimmer.css";
import {SkeletonProps} from "@/app/models/ui/skeletonProps";
import {Card, CardContent, CardHeader} from "@/app/ui/base/card";
import {Skeleton} from "@/app/ui/base/skeleton";

export function CardSkeleton({ skeletonProps }: { skeletonProps: SkeletonProps }) {
    return (
        <Card className={skeletonProps.showShimmer ? 'shimmer' : ''}>
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-4 w-16" />
            </CardHeader>
            <CardContent>
                <div className="rounded-lg bg-background p-8">
                    <Skeleton className="mx-auto h-7 w-20" />
                </div>
            </CardContent>
        </Card>
    );
}