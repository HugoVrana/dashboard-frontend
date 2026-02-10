"use client"

import {ActivityEvent} from "@/app/models/ui/activity/activityEvent";
import {Badge} from "@/app/ui/base/badge";

export default function GrantAddedActivity({activity}: {activity: ActivityEvent}) {
    const actorId = activity.actorId as string | undefined;
    const grantName = activity.grantName as string | undefined;

    return (
        <li className="flex items-center gap-3 p-3 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 transition-colors border-l-2 border-purple-500">
            <div className="flex items-center gap-2 shrink-0">
                <Badge variant="default" className="bg-purple-600">
                    Grant
                </Badge>
            </div>

            <div className="flex-1 min-w-0">
                <span className="text-sm">
                    <span className="text-muted-foreground">New grant </span>
                    <span className="font-medium text-foreground">{grantName ?? "unknown"}</span>
                    <span className="text-muted-foreground"> added by </span>
                    <span className="font-medium text-foreground">{actorId ?? "unknown"}</span>
                </span>
            </div>

            {activity.timestamp && (
                <span className="text-xs text-muted-foreground shrink-0">
                    {new Date(activity.timestamp).toLocaleTimeString()}
                </span>
            )}
        </li>
    )
}
