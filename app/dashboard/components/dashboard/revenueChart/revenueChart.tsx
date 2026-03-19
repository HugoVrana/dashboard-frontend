"use client"

import {Calendar} from "lucide-react";
import {Bar, BarChart, Tooltip, XAxis, YAxis} from "recharts";
import {useContext, useEffect, useRef, useState} from "react";
import {
    Card,
    CardContent, CardDescription,
    CardHeader,
    CardTitle,
} from "@hugovrana/dashboard-frontend-shared";
import {RevenueChartSkeleton} from "@/app/dashboard/components/skeletons/revenueChartSkeleton";
import {ApiContext} from "@/app/shared/components/devOverlay/apiContext";
import {usePermissions} from "@/app/auth/permission/permissionsClient";
import {RevenueRead} from "@/app/dashboard/models/revenueRead";
import {useDebugTranslations} from "@/app/shared/contexts/translations/useDebugTranslations";
import {getRevenue} from "@/app/dashboard/dataAccess/revenueClient";

export default function RevenueChart() {
    const { dashboardApiIsLocal, isReady: apiContextReady } = useContext(ApiContext);
    const {hasGrant, isLoading, getAuthToken} = usePermissions();
    const canViewRevenue : boolean = hasGrant("dashboard-revenue-read");
    const [revenue, setRevenue] = useState<RevenueRead[] | null>(null);
    const [dataLoading, setDataLoading] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const [chartWidth, setChartWidth] = useState(0);

    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver(entries => {
            setChartWidth(entries[0].contentRect.width);
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [revenue]);

    const skellyProps = {showShimmer : true};
    const skellyNoPermissionProps = {showShimmer : false};

    const t = useDebugTranslations("dashboard.controls.revenueChart");

    useEffect(() => {
        if (!apiContextReady || isLoading || !getAuthToken || !canViewRevenue) return;

        async function loadData() {
            setDataLoading(true);
            try {
                const loadingRevenue : RevenueRead[] | null = await getRevenue(dashboardApiIsLocal, getAuthToken);
                if (loadingRevenue !== null) {
                    setRevenue(loadingRevenue);
                }
            } catch (error) {
                console.error("Failed to load data:", error);
            } finally {
                setDataLoading(false);
            }
        }

        loadData();
    },  [apiContextReady, dashboardApiIsLocal, isLoading, getAuthToken, canViewRevenue]);

    if (!canViewRevenue) {
        return <RevenueChartSkeleton skeletonProps={skellyNoPermissionProps} />;
    }

    if (dataLoading) {
        return <RevenueChartSkeleton skeletonProps={skellyProps} />;
    }

    if (!revenue || revenue.length === 0) {
        return (
            <Card className="md:col-span-4">
                <CardHeader>
                    <CardTitle>{t('title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{t('noData')}</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="md:col-span-4">
            <CardHeader>
                <CardTitle>{t('title')}</CardTitle>
            </CardHeader>
            <CardContent>
                <div
                    ref={containerRef}
                    className="w-full text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-layer]:outline-hidden [&_.recharts-surface]:outline-hidden"
                >
                    {chartWidth > 0 && (
                        <BarChart data={revenue} width={chartWidth} height={300}>
                            <XAxis
                                dataKey="month"
                                tickLine={false}
                                axisLine={false}
                                fontSize={12}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                fontSize={12}
                                tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
                            <Bar
                                dataKey="revenue"
                                fill="hsl(var(--primary))"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    )}
                </div>
                <CardDescription className="flex items-center gap-2 pt-4">
                    <Calendar className="h-4 w-4" />
                    {t('timeFrame')}
                </CardDescription>
            </CardContent>
        </Card>
    );
}