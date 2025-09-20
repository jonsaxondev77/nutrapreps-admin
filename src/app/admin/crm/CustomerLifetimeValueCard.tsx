import React from 'react';
import ComponentCard from '@/components/common/ComponentCard';


interface CustomerLifetimeValueCardProps {
  ltv: number;
}

const CustomerLifetimeValueCard = ({ ltv }: CustomerLifetimeValueCardProps) => {
  return (
    <ComponentCard title="Customer Lifetime Value">
      <div className="flex flex-col items-center justify-center p-6">
        <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          £{ltv}
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Total value of all customers
        </p>
      </div>
    </ComponentCard>
  );
};

export default CustomerLifetimeValueCard;