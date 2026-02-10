"use client"

import {ActivityEvent} from "@/app/models/ui/activity/activityEvent";
import {Badge} from "@/app/ui/base/badge";

export default function GrantRemovedFromRoleActivity({activity}: {activity: ActivityEvent}) {
    const actorId = activity.actorId as string | undefined;
    const grantName = activity.grantName as string | undefined;
    const roleName = activity.roleName as string | undefined;

    return (
        <li className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors border-l-2 border-red-500">
            <div className="flex items-center gap-2 shrink-0">
                <Badge variant="destructive">
                    Revoked
                </Badge>
            </div>

            <div className="flex-1 min-w-0">
                <span className="text-sm">
                    <span className="font-medium text-foreground">{grantName ?? "unknown"}</span>
                    <span className="text-muted-foreground"> removed from </span>
                    <span className="font-medium text-foreground">{roleName ?? "unknown"}</span>
                    <span className="text-muted-foreground"> by </span>
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
