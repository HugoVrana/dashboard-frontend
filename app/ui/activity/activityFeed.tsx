"use client"

import {useEffect, useState} from "react";
import {ActivityClient} from "@/app/lib/dataAccess/websocket/activityClient";
import {ActivityEvent} from "@/app/models/ui/activity/activityEvent";
import {ActivityFeedProps} from "@/app/models/ui/activity/activityFeedProps";
import {useDebugTranslations} from "@/app/lib/i18n/useDebugTranslations";
import {Card, CardContent, CardHeader, CardTitle} from "@hugovrana/dashboard-frontend-shared";
import ActivityEventDisplay from "@/app/ui/activity/activityEventDisplay";

export function ActivityFeed({
    sources,
    maxItems = 20
} : ActivityFeedProps) {
    const [events, setEvents] = useState<ActivityEvent[]>([]);
    const [connectionStatus, setConnectionStatus] = useState<Record<string, boolean>>({});

    const t = useDebugTranslations("dashboard.controls.activityFeed");

    useEffect(() => {
        const clients: ActivityClient[] = [];

        sources.forEach((source) => {
            const client = new ActivityClient(source.brokerURL);

            client.subscribe(source.topic || "/topic/activity", (event) => {
                const enrichedEvent: ActivityEvent = {
                    ...(event as ActivityEvent),
                    source: source.name,
                    timestamp: (event as ActivityEvent).timestamp || new Date().toISOString(),
                };
                
                console.log("Enriched event");
                console.log(enrichedEvent);
                setEvents((prev) => {
                    const newEvents = [enrichedEvent, ...prev];
                    return newEvents.slice(0, maxItems);
                });
            });

            client.connect();
            clients.push(client);

            setConnectionStatus((prev) => ({ ...prev, [source.name]: true }));
        });

        return () => {
            clients.forEach((client) => client.disconnect());
            setConnectionStatus({});
        };
    }, [sources, maxItems]);

    return (
        <Card className="w-full">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{t('title')}</CardTitle>
                    <div className="flex gap-2">
                        {sources.map((source) => (
                            <div key={source.name} className="flex items-center gap-1">
                                <span className={`h-2 w-2 rounded-full ${connectionStatus[source.name] ? 'bg-green-500' : 'bg-red-500'}`} />
                                <span className="text-xs text-muted-foreground">{source.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {events.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        {t('noActivity')}
                    </p>
                ) : (
                    <ul className="space-y-2">
                        {events.map((event: ActivityEvent, index: number) => (
                            <ActivityEventDisplay
                                key={event.id ?? `${event.source}-${index}`}
                                activity={event}/>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
}
