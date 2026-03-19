import RevenueChart from "@/app/dashboard/components/dashboard/revenueChart/revenueChart";
import LatestInvoices from "@/app/dashboard/components/dashboard/latestInvoices/latestInvoices";

export default function Page(){
    return (
        <div>
            <RevenueChart/>
            <LatestInvoices/>
        </div>
        );
}