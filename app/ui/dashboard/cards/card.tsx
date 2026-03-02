import {Banknote, ClockIcon, InboxIcon, Users} from "lucide-react";
import {CardProps} from "@/app/models/ui/cardProps";
import {CardType} from "@/app/models/ui/cardType";
import {Suspense} from "react";
import {Card, CardContent, CardHeader} from "@hugovrana/dashboard-frontend-shared";
import {CardSkeleton} from "@/app/ui/skeletons/cardSkeleton";

const iconMap = {
    collected: Banknote,
    customers: Users,
    pending: ClockIcon,
    invoices: InboxIcon,
};

export function DashboardCard(cardProps : CardProps) {
    const Icon = iconMap[cardProps.type];

    const formatValue = (type: CardType, value: number | string) => {
        if (type === "collected" || type === "pending") {
            const numValue = typeof value === "string" ? parseFloat(value) : value;
            return `$${numValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
        }
        return value;
    };

    return (
        <Suspense fallback={<CardSkeleton skeletonProps={cardProps.skeletonProps}/>}>
            <Card>
                <CardHeader className="flex flex-row items-center gap-2 pb-2">
                    {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
                    <span className="text-sm font-medium text-foreground">{cardProps.title}</span>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg bg-background p-8">
                        <p className={`text-center text-2xl tabular-nums text-foreground`} >
                            {formatValue(cardProps.type, cardProps.value)}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </Suspense>
    );
}