"use client";
import { useGetDemographicsDataQuery } from "@/lib/services/dashboardApi";
import NorthWestMap from "./NorthWestMap"; // Import the new map

export default function DemographicCard() {
  const { data: demographics, isLoading, error } = useGetDemographicsDataQuery();

  // Calculate the total customers from the fetched data
  const totalCustomers = demographics?.reduce((sum, city) => sum + city.customerCount, 0) || 0;

  if (isLoading) return <div>Loading Demographics...</div>;
  if (error) return <div>Error loading data.</div>;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="flex justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Customer Demographics
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Top customer locations in the North West
          </p>
        </div>
      </div>
      <div className="px-4 py-6 my-6 overflow-hidden border border-gray-200 rounded-2xl bg-gray-50 dark:border-gray-800 dark:bg-gray-900 sm:px-6">
        <div className="-mx-4 -my-6 h-[212px]">
          <NorthWestMap />
        </div>
      </div>

      <div className="space-y-5">
        {demographics && demographics.map((cityData) => {
            const percentage = totalCustomers > 0 ? (cityData.customerCount / totalCustomers) * 100 : 0;
            return (
                <div key={cityData.city} className="flex items-center justify-between">
                    <div>
                        <p className="font-semibold text-gray-800 text-theme-sm dark:text-white/90">
                            {cityData.city}
                        </p>
                        <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                            {cityData.customerCount} Customers
                        </span>
                    </div>
                    <div className="flex w-full max-w-[140px] items-center gap-3">
                        <div className="relative block h-2 w-full max-w-[100px] rounded-sm bg-gray-200 dark:bg-gray-800">
                            <div style={{ width: `${percentage}%` }} className="absolute left-0 top-0 flex h-full items-center justify-center rounded-sm bg-brand-500 text-xs font-medium text-white"></div>
                        </div>
                        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {Math.round(percentage)}%
                        </p>
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
}