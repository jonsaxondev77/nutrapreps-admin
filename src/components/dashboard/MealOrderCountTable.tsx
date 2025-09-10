'use client';
import React, { useState } from 'react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import DatePickerCustom from '@/components/form/date-picker-custom';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { useGetMealOrderCountForDateQuery } from '@/lib/services/dashboardApi';
import TableSkeleton from '@/components/tables/TableSkeleton';
import ErrorAlert from '@/components/common/ErrorAlert';

const formatDateForApi = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day} 00:00:00.0000000`;
};

const MealOrderCountTable = () => {
    const [selectedDate, setSelectedDate] = useState(formatDateForApi(new Date()));

    const { data, error, isLoading } = useGetMealOrderCountForDateQuery({
        targetDate: selectedDate
    });

    const handleDateChange = (date: Date) => {
        setSelectedDate(formatDateForApi(date));
    };

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-white/[0.05] dark:bg-white/[0.03] sm:p-7">
            <div className="mb-6 flex items-center justify-between">
                <h3 className="text-theme-sm font-medium text-gray-900 dark:text-white/90">
                    Meal Order Counts
                </h3>
            </div>
            <div className="mb-4 flex items-center justify-between">
                <DatePickerCustom
                    id="meal-count-date-picker"
                    selected={selectedDate}
                    onChange={handleDateChange}
                />
            </div>
            
            {isLoading && <TableSkeleton columns={3} rows={5} />}
            
            {error && <ErrorAlert error={error} title="Error loading meal counts" />}
            
            {data && data.length > 0 ? (
                <div className="max-w-full overflow-x-auto">
                    <Table>
                        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                            <TableRow>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Meal Name</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Meal Option ID</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Count</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            {data.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{item.mealName}</TableCell>
                                    <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">{item.mealOptionId}</TableCell>
                                    <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">{item.mealCount}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <p className="text-center text-gray-500 dark:text-gray-400">No meal counts found for the selected date.</p>
            )}
        </div>
    );
};

export default MealOrderCountTable;