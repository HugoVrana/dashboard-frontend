import {RevenueRead} from "@/app/models/revenue/revenueRead";

export function isRevenue(x: any): x is RevenueRead {
    return x && typeof x === "object"
        && typeof x.month === "string"
        && typeof x.revenue === "number"; // if you keep it as ISO string
}

export function mapToRevenueRead(x: any): RevenueRead | null {
    if (isRevenue(x)) {
        return {
            month: x.month,
            revenue: x.revenue
        }
    }
    return null;
}