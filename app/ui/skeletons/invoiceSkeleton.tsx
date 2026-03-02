import {SkeletonProps} from "@/app/models/ui/skeletonProps";

export function InvoiceSkeleton({skeletonProps} : {skeletonProps : SkeletonProps}) {
    return (
        <div className={`${skeletonProps.showShimmer ? 'shimmer' : ''} flex flex-row items-center justify-between border-b border-border py-4`}>
            <div className="flex items-center">
                <div className="mr-2 h-8 w-8 rounded-full bg-muted" />
                <div className="min-w-0">
                    <div className="h-5 w-40 rounded-md bg-muted" />
                    <div className="mt-2 h-4 w-12 rounded-md bg-muted" />
                </div>
            </div>
            <div className="mt-2 h-4 w-12 rounded-md bg-muted" />
        </div>
    );
}