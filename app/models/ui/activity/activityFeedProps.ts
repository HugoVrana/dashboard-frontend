import {ActivitySource} from "@/app/models/ui/activity/activitySource";

export interface ActivityFeedProps {
    title?: string;
    sources: ActivitySource[];
    maxItems?: number;
}