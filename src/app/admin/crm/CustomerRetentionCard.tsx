// src/components/crm/CustomerRetentionCard.tsx

import React from 'react';
import ComponentCard from '@/components/common/ComponentCard';
import { CustomerRetentionDto } from '@/types/crm';


interface CustomerRetentionCardProps {
  metrics: CustomerRetentionDto;
}

const CustomerRetentionCard = ({ metrics }: CustomerRetentionCardProps) => {
  return (
    <ComponentCard title="Customer Retention & Reactivation">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
        <div>
          <h4 className="text-md font-semibold text-gray-700 dark:text-gray-200">
            Active Customers
          </h4>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {metrics.activeCustomers}
          </p>
        </div>
        <div>
          <h4 className="text-md font-semibold text-gray-700 dark:text-gray-200">
            At-Risk Customers
          </h4>
          <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
            {metrics.atRiskCustomers}
          </p>
        </div>
        <div>
          <h4 className="text-md font-semibold text-gray-700 dark:text-gray-200">
            Reactivated Customers
          </h4>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {metrics.reactivatedCustomers}
          </p>
        </div>
        <div>
          <h4 className="text-md font-semibold text-gray-700 dark:text-gray-200">
            Reactivation Rate
          </h4>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {metrics.reactivationRate.toFixed(2)}%
          </p>
        </div>
      </div>
    </ComponentCard>
  );
};

export default CustomerRetentionCard;