"use client"

import {ActivityEvent} from "@/app/models/ui/activity/activityEvent";
import {Badge} from "@/app/ui/base/badge";

export default function GenericActivity({activity} : {activity : ActivityEvent}) {
    const actorId = activity.actorId as string | undefined;
    const isAuthSource : boolean | undefined = activity.source?.toLowerCase().includes("auth");

    return(
        <li className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
            <div className="flex items-center gap-2 shrink-0">
                <Badge variant={isAuthSource ? "destructive" : "default"}>
                    {isAuthSource ? "Auth" : "Data"}
                </Badge>
                {activity.type && (
                    <Badge variant="outline">
                        {activity.type}
                    </Badge>
                )}
            </div>

            <div className="flex-1 min-w-0">
                {actorId && (
                    <span className="text-sm font-medium text-foreground">
                        {actorId}
                    </span>
                )}
                {!actorId && (
                    <span className="text-sm text-muted-foreground italic">
                        Unknown actor
                    </span>
                )}
            </div>

            {activity.timestamp && (
                <span className="text-xs text-muted-foreground shrink-0">
                    {new Date(activity.timestamp).toLocaleTimeString()}
                </span>
            )}
        </li>
    )
}