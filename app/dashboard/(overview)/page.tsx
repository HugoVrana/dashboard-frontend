import Cards from "@/app/ui/custom/dashboard/cards/cards";
import RevenueChart from "@/app/ui/custom/dashboard/revenueChart/revenueChart";
import LatestInvoices from "@/app/ui/custom/dashboard/latestInvoices/latestInvoices";
import {useTranslations} from "next-intl";

export default function Page() {
    const t = useTranslations("dashboard.overview");
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
 )
}