"use client"

import {Calendar} from "lucide-react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/app/ui/base/card";
import {ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent} from "@/app/ui/base/chart";
import {Bar, BarChart, XAxis, YAxis} from "recharts";
import {useContext, useEffect, useState} from "react";
import {ApiContext} from "@/app/lib/devOverlay/apiContext";
import {usePermissions} from "@/app/lib/permission/permissionsClient";
import {RevenueRead} from "@/app/models/revenue/revenueRead";
import {getRevenue} from "@/app/lib/dataAccess/revenueClient";
import {useTranslations} from "next-intl";

const chartConfig = {
    revenue: {
        label: "Revenue",
        color: "hsl(var(--primary))",
    },
} satisfies ChartConfig;

export default function RevenueChart() {
    const { dashboardApiIsLocal } = useContext(ApiContext);
    const {hasGrant, isLoading, getAuthToken} = usePermissions();
    const [canViewRevenue, setCanViewRevenue] = useState(false);
    const [revenue, setRevenue] = useState<RevenueRead[] | null>(null);

    const t = useTranslations("dashboard.controls.revenueChart");

    useEffect(() => {
        if (isLoading) return;

        const revenueRead : boolean = hasGrant("dashboard-revenue-read");

        setCanViewRevenue(revenueRead);

        async function loadData() {
            try {
                if (canViewRevenue) {
                    const revenue : RevenueRead[] |null = await getRevenue(dashboardApiIsLocal, getAuthToken);
                    setRevenue(revenue);
                }
            } catch (error) {
                console.error("Failed to load data:", error);
            }
        }

        loadData();
    },  [dashboardApiIsLocal, isLoading, hasGrant, getAuthToken]);

    if (!isLoading) {
        if (revenue) {
            return (
                <Card className="md:col-span-4">
                    <CardHeader>
                        <CardTitle>{t('title')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-87.5 w-full">
                            <BarChart data={revenue}>
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
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar
                                    dataKey="revenue"
                                    fill="var(--color-revenue)"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ChartContainer>
                        <CardDescription className="flex items-center gap-2 pt-4">
                            <Calendar className="h-4 w-4" />
                            {t('timeFrame')}
                        </CardDescription>
                    </CardContent>
                </Card>
            );
        }
    }
    return (t('noData'))
}