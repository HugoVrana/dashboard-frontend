"use client"

import {useDebugTranslations} from "@/app/shared/contexts/translations/useDebugTranslations";
import Cards from "@/app/dashboard/components/dashboard/cards/cards";
import RevenueChart from "@/app/dashboard/components/dashboard/revenueChart/revenueChart";
import LatestInvoices from "@/app/dashboard/components/dashboard/latestInvoices/latestInvoices";

export default function OverviewContent() {
    const t = useDebugTranslations("dashboard.overview");
    return (
        <main className="p-6 pt-10">
            <h1 className={`mb-4 text-xl md:text-2xl`}>
                {t("dashboard")}
            </h1>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <Cards />
            </div>
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
                <RevenueChart/>
                <LatestInvoices/>
            </div>
        </main>
    );
}
