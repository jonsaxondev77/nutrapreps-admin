import React from 'react';
import ComponentCard from '@/components/common/ComponentCard';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';

interface CustomerSegmentationCardProps {
  segments: { label: string; count: number }[];
}

const CustomerSegmentationCard = ({ segments }: CustomerSegmentationCardProps) => {
  return (
    <ComponentCard title="Customer Segmentation">
      <div className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Segment</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Count</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {segments.map((segment, index) => (
              <TableRow key={index}>
                <TableCell className="px-5 py-4 text-gray-800 text-start dark:text-white/90">{segment.label}</TableCell>
                <TableCell className="px-5 py-4 text-gray-800 text-start dark:text-white/90">{segment.count}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </ComponentCard>
  );
};

export default CustomerSegmentationCard;