import {type RevenueRead, RevenueReadSchema} from "@/app/models/revenue/revenueRead";

export function isRevenue(x: unknown): x is RevenueRead {
    return RevenueReadSchema.safeParse(x).success;
}

export function mapToRevenueRead(x: unknown): RevenueRead | null {
    const result = RevenueReadSchema.safeParse(x);
    return result.success ? result.data : null;
}
