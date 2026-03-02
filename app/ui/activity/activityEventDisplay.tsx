"use client"

import {ActivityEvent} from "@/app/models/ui/activity/activityEvent";
import UserLoggedInActivity from "@/app/ui/activity/activityType/userLoggedInActivity";
import UserRegisteredActivity from "@/app/ui/activity/activityType/userRegisteredActivity";
import GrantAddedActivity from "@/app/ui/activity/activityType/grantAddedActivity";
import RoleAddedActivity from "@/app/ui/activity/activityType/roleAddedActivity";
import GrantAddedToRoleActivity from "@/app/ui/activity/activityType/grantAddedToRoleActivity";
import GrantRemovedFromRoleActivity from "@/app/ui/activity/activityType/grantRemovedFromRoleActivity";
import GenericActivity from "@/app/ui/activity/activityType/genericActivity";

export default function ActivityEventDisplay({activity}: {activity: ActivityEvent}) {
    switch (activity.type) {
        case "USER_LOGGED_IN":
            return <UserLoggedInActivity activity={activity} />
        case "USER_REGISTERED":
            return <UserRegisteredActivity activity={activity} />
        case "GRANT_ADDED":
            return <GrantAddedActivity activity={activity} />
        case "ROLE_ADDED":
            return <RoleAddedActivity activity={activity} />
        case "GRANT_ADDED_TO_ROLE":
            return <GrantAddedToRoleActivity activity={activity} />
        case "GRANT_REMOVED_FROM_ROLE":
            return <GrantRemovedFromRoleActivity activity={activity} />
        default:
            return <GenericActivity activity={activity} />
    }
}