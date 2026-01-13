import Cards from "@/app/ui/custom/dashboard/cards/cards";
import RevenueChart from "@/app/ui/custom/dashboard/revenue/revenueChart/revenueChart";

export default function Page() {
 return (
     <main>
         <h1 className={`mb-4 text-xl md:text-2xl`}>
             Dashboard
         </h1>
         <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
             <Cards />
         </div>
         <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
             <RevenueChart />
         </div>
     </main>
 )
}