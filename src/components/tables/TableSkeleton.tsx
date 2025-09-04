import React from 'react';

interface TableSkeletonProps {
  columns: number;
  rows: number;
}

const TableSkeleton: React.FC<TableSkeletonProps> = ({ columns, rows }) => {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-100 dark:bg-gray-800 h-10 rounded-lg mb-4"></div>
      <div className="bg-gray-100 dark:bg-gray-800 h-10 rounded-lg mb-4"></div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="flex items-center space-x-4 mb-2 p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md flex-1"></div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default TableSkeleton;