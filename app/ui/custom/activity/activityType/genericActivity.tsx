"use client"

import {ActivityEvent} from "@/app/models/ui/activity/activityEvent";
import {Badge} from "@/app/ui/base/badge";
import {Avatar, AvatarFallback, AvatarImage} from "@/app/ui/base/avatar";
import {getUserProfileImageUrl} from "@/app/lib/dataAccess/usersClient";
import {useContext, useEffect, useState} from "react";
import {ApiContext} from "@/app/lib/devOverlay/apiContext";

export default function GenericActivity({activity} : {activity : ActivityEvent}) {
    const { dashboardAuthApiIsLocal } = useContext(ApiContext);
    const [customerImageUrl, setCustomerImageUrl] = useState<string | null>(null);

    const actorId = activity.actorId as string | undefined;

    useEffect(() => {
        if (!actorId) return;

        getUserProfileImageUrl(dashboardAuthApiIsLocal, actorId)
            .then(setCustomerImageUrl)
            .catch((err) => console.error("Failed to fetch profile image:", err));
    }, [actorId, dashboardAuthApiIsLocal]);

    const isAuthSource : boolean | undefined = activity.source?.toLowerCase().includes("auth");

    return(
        <li className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
            <Avatar size="sm">
                {customerImageUrl && <AvatarImage src={customerImageUrl} alt={actorId ?? "User"} />}
                <AvatarFallback>{actorId?.charAt(0)?.toUpperCase() ?? "?"}</AvatarFallback>
            </Avatar>

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