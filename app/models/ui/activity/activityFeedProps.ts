import {ActivitySource} from "@/app/models/ui/activity/activitySource";

export interface ActivityFeedProps {
    sources: ActivitySource[];
    maxItems?: number;
}