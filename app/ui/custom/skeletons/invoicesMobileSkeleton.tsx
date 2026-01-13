import "@/app/ui/custom/skeletons/shimmer.css";
import {SkeletonProps} from "@/app/models/ui/skeletonProps";

export function InvoicesMobileSkeleton({skeletonProps} : {skeletonProps : SkeletonProps}) {
    return (
        <div className={`${skeletonProps.showShimmer ? 'shimmer' : ''} mb-2 w-full rounded-md bg-white p-4`}>
            <div className="flex items-center justify-between border-b border-gray-100 pb-8">
                <div className="flex items-center">
                    <div className="mr-2 h-8 w-8 rounded-full bg-gray-100"></div>
                    <div className="h-6 w-16 rounded bg-gray-100"></div>
                </div>
                <div className="h-6 w-16 rounded bg-gray-100"></div>
            </div>
            <div className="flex w-full items-center justify-between pt-4">
                <div>
                    <div className="h-6 w-16 rounded bg-gray-100"></div>
                    <div className="mt-2 h-6 w-24 rounded bg-gray-100"></div>
                </div>
                <div className="flex justify-end gap-2">
                    <div className="h-10 w-10 rounded bg-gray-100"></div>
                    <div className="h-10 w-10 rounded bg-gray-100"></div>
                </div>
            </div>
        </div>
    );
}