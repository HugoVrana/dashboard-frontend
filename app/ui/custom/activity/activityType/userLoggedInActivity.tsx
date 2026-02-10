"use client"

import {ActivityEvent} from "@/app/models/ui/activity/activityEvent";
import {Badge} from "@/app/ui/base/badge";

export default function UserLoggedInActivity({activity}: {activity: ActivityEvent}) {
    const actorId = activity.actorId as string | undefined;

    return (
        <li className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 hover:bg-green-500/20 transition-colors border-l-2 border-green-500">
            <div className="flex items-center gap-2 shrink-0">
                <Badge variant="default" className="bg-green-600">
                    Login
                </Badge>
            </div>

            <div className="flex-1 min-w-0">
                <span className="text-sm">
                    <span className="font-medium text-foreground">{actorId ?? "Unknown user"}</span>
                    <span className="text-muted-foreground"> logged in</span>
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
