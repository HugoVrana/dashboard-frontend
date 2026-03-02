import "@/app/ui/skeletons/shimmer.css";
import {SkeletonProps} from "@/app/models/ui/skeletonProps";

export function InvoicesMobileSkeleton({skeletonProps} : {skeletonProps : SkeletonProps}) {
    return (
        <div className={`${skeletonProps.showShimmer ? 'shimmer' : ''} mb-2 w-full rounded-md bg-card p-4`}>
            <div className="flex items-center justify-between border-b border-border pb-8">
                <div className="flex items-center">
                    <div className="mr-2 h-8 w-8 rounded-full bg-muted"></div>
                    <div className="h-6 w-16 rounded bg-muted"></div>
                </div>
                <div className="h-6 w-16 rounded bg-muted"></div>
            </div>
            <div className="flex w-full items-center justify-between pt-4">
                <div>
                    <div className="h-6 w-16 rounded bg-muted"></div>
                    <div className="mt-2 h-6 w-24 rounded bg-muted"></div>
                </div>
                <div className="flex justify-end gap-2">
                    <div className="h-10 w-10 rounded bg-muted"></div>
                    <div className="h-10 w-10 rounded bg-muted"></div>
                </div>
            </div>
        </div>
    );
}