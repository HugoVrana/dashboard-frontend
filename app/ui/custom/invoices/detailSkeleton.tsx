import {Card, CardContent} from "@/app/ui/base/card";
import {Skeleton} from "@/app/ui/base/skeleton";

export default function DetailSkeleton(){
    return (
    <div className="space-y-6">
        <Skeleton className="h-10 w-32" />
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>
            </CardContent>
        </Card>
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardContent className="p-6">
                    <Skeleton className="h-4 w-24 mb-4" />
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-36" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-6">
                    <Skeleton className="h-4 w-32 mb-4" />
                    <Skeleton className="h-8 w-28 mb-4" />
                    <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
    );
}