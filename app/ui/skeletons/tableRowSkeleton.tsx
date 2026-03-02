import {SkeletonProps} from "@/app/models/ui/skeletonProps";

export function TableRowSkeleton({skeletonProps} : {skeletonProps : SkeletonProps}) {
    const cellShimmer = skeletonProps.showShimmer ? 'shimmer' : '';

    return (
        <tr className="w-full border-b border-border last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg">
            {/* Invoice # */}
            <td className={`whitespace-nowrap px-3 py-3 ${cellShimmer}`}>
                <div className="h-6 w-32 rounded bg-muted"></div>
            </td>
            {/* Customer Name and Image */}
            <td className={`whitespace-nowrap py-3 pl-6 pr-3 ${cellShimmer}`}>
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted"></div>
                    <div className="h-6 w-24 rounded bg-muted"></div>
                </div>
            </td>
            {/* Email */}
            <td className={`whitespace-nowrap px-3 py-3 ${cellShimmer}`}>
                <div className="h-6 w-32 rounded bg-muted"></div>
            </td>
            {/* Amount */}
            <td className={`whitespace-nowrap px-3 py-3 ${cellShimmer}`}>
                <div className="h-6 w-16 rounded bg-muted"></div>
            </td>
            {/* Date */}
            <td className={`whitespace-nowrap px-3 py-3 ${cellShimmer}`}>
                <div className="h-6 w-16 rounded bg-muted"></div>
            </td>
            {/* Status */}
            <td className={`whitespace-nowrap px-3 py-3 ${cellShimmer}`}>
                <div className="h-6 w-16 rounded bg-muted"></div>
            </td>
            {/* Actions */}
            <td className={`whitespace-nowrap py-3 pl-6 pr-3 ${cellShimmer}`}>
                <div className="flex justify-end gap-3">
                    <div className="h-[38px] w-[38px] rounded bg-muted"></div>
                    <div className="h-[38px] w-[38px] rounded bg-muted"></div>
                </div>
            </td>
        </tr>
    );
}