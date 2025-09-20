// src/app/admin/crm/CrmDashboardClient.tsx

'use client';


import TableSkeleton from '@/components/tables/TableSkeleton';
import ErrorAlert from '@/components/common/ErrorAlert';
import ComponentCard from '@/components/common/ComponentCard';
import DemographicCard from '@/components/ecommerce/DemographicCard';
import CustomerLifetimeValueCard from './CustomerLifetimeValueCard';
import CustomerRetentionCard from './CustomerRetentionCard';
import CustomerSegmentationCard from './CustomerSegmentationCard';
import { useGetCrmDataQuery } from '@/lib/services/crnApi';


const CrmDashboardClient = () => {
  const { data, isLoading, isError } = useGetCrmDataQuery();

  if (isLoading) {
    return <TableSkeleton rows={2} columns={2}/>;
  }

  if (isError) {
    return <ErrorAlert error="Failed to load CRM dashboard data." />;
  }
  
  const { totalRevenue, customerDemographics, customerSegments, retentionMetrics } = data;

  return (
     <div className="grid grid-cols-12 gap-6">
      {/* First Row of Cards with Equal Height */}
      <div className="col-span-12 grid lg:grid-cols-2 gap-6 items-stretch">
        <CustomerLifetimeValueCard ltv={totalRevenue} />
        <CustomerRetentionCard metrics={retentionMetrics} />
      </div>
      {/* Second Row of Cards with Equal Height */}
      <div className="col-span-12 grid lg:grid-cols-2 gap-6 items-stretch">
        <DemographicCard/>
        <CustomerSegmentationCard segments={customerSegments} />
      </div>
    </div>
  );
};

export default CrmDashboardClient;