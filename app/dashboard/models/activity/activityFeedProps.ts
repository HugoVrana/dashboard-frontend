import {ActivitySource} from "@/app/dashboard/models/activity/activitySource";

export interface ActivityFeedProps {
    sources: ActivitySource[];
    maxItems?: number;
}