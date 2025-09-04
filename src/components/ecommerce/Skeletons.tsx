export const MetricCardSkeleton: React.FC = () => (
  <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 animate-pulse">
    <div className="flex items-center justify-center w-12 h-12 bg-gray-200 rounded-xl dark:bg-gray-700"></div>
    <div className="flex items-end justify-between mt-5">
      <div>
        <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
        <div className="w-24 h-6 mt-2 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
      </div>
      <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
    </div>
  </div>
);

export const MonthlyTargetSkeleton: React.FC = () => (
  <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03] animate-pulse">
    <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-11 dark:bg-gray-900 sm:px-6 sm:pt-6">
      <div className="flex justify-between">
        <div>
          <div className="w-32 h-6 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
          <div className="w-48 h-4 mt-1 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
        </div>
      </div>
      <div className="flex items-center justify-center h-[330px] w-full">
        <div className="w-40 h-40 rounded-full bg-gray-200 dark:bg-gray-700"></div>
      </div>
      <div className="w-64 h-4 mx-auto mt-10 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
    </div>
    <div className="flex items-center justify-center gap-5 px-6 py-3.5 sm:gap-8 sm:py-5">
      <div className="w-20 h-10 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
      <div className="w-px h-7 bg-gray-200 dark:bg-gray-800"></div>
      <div className="w-20 h-10 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
    </div>
  </div>
);

export const ChartCardSkeleton: React.FC = () => (
  <div className="rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="w-40 h-6 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
    </div>
    <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
  </div>
);

export const StatisticsChartSkeleton: React.FC = () => (
  <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6 animate-pulse">
    <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
      <div className="w-full">
        <div className="w-40 h-6 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
        <div className="w-60 h-4 mt-1 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
      </div>
    </div>
    <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
  </div>
);

export const DemographicCardSkeleton: React.FC = () => (
  <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 animate-pulse">
    <div className="flex justify-between">
      <div>
        <div className="w-48 h-6 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
        <div className="w-64 h-4 mt-1 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
      </div>
    </div>
    <div className="px-4 py-6 my-6 overflow-hidden border border-gray-200 rounded-2xl bg-gray-50 dark:border-gray-800 dark:bg-gray-900 sm:px-6 h-52">
      <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-md"></div>
    </div>
    <div className="space-y-5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between">
          <div>
            <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
            <div className="w-24 h-3 mt-1 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
          </div>
          <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
        </div>
      ))}
    </div>
  </div>
);

export const RecentOrdersSkeleton: React.FC = () => (
  <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 animate-pulse">
    <div className="w-32 h-6 mb-4 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
    <div className="max-w-full overflow-x-auto">
      <div className="min-w-[1102px]">
        <div className="border-y border-gray-100 dark:border-gray-800">
          <div className="flex p-3">
            <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
            <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
            <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
          </div>
        </div>
        <div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center py-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex-1 flex flex-col gap-1 p-3">
                <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
              </div>
              <div className="flex-1 p-3">
                <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
              </div>
              <div className="flex-1 p-3">
                <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const DashboardSkeleton: React.FC = () => (
  <div className="grid grid-cols-12 gap-4 md:gap-6">
    <div className="col-span-12 space-y-6 xl:col-span-7">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
        <MetricCardSkeleton />
        <MetricCardSkeleton />
      </div>
      <ChartCardSkeleton />
    </div>
    <div className="col-span-12 xl:col-span-5">
      <MonthlyTargetSkeleton />
    </div>
    <div className="col-span-12">
      <StatisticsChartSkeleton />
    </div>
    <div className="col-span-12 xl:col-span-5">
      <DemographicCardSkeleton />
    </div>
    <div className="col-span-12 xl:col-span-7">
      <RecentOrdersSkeleton />
    </div>
  </div>
);
