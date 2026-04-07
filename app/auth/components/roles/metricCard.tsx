import {MetricCardProps} from "@/app/auth/models/components/metricCardProps";

export function MetricCard(props : MetricCardProps) {
    return (
        <div className="rounded-2xl border border-border/70 bg-background p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{props.title}</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{props.value}</p>
        </div>
    );
}