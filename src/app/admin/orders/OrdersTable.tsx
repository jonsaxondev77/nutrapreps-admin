'use client';

import { useGetOrdersQuery } from '@/lib/services/ordersApi';
import { Order, OrderListResponse, OrderStatus } from '@/types/orders';
import { PagedResponse } from '@/types/global';
import React, { useState } from 'react';
import Pagination from '@/components/tables/Pagination';
import { format } from 'date-fns';
import { Eye, Loader } from 'lucide-react';
import OrderDetailsModal from './OrderDetailsModal';
import Button from '@/components/ui/button/Button';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import DatePickerCustom from '@/components/form/date-picker-custom';
import TableSkeleton from '@/components/tables/TableSkeleton';
import ErrorAlert from '@/components/common/ErrorAlert';

const getPreviousSunday = (date: Date) => {
    const d = new Date(date);
    d.setDate(d.getDate() - d.getDay());
    d.setHours(0, 0, 0, 0);
    d.setMinutes(0);
    d.setSeconds(0);
    d.setMilliseconds(0);
    return d;
};


const OrdersTable = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedDate, setSelectedDate] = useState(getPreviousSunday(new Date()));

    const weekStartISO = new Date(Date.UTC(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())).toISOString();

    const { data, error, isLoading } = useGetOrdersQuery({
        pageNumber: currentPage,
        pageSize: 100,
        weekStart: weekStartISO,
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

    const handleViewDetails = (orderId: number) => {
        setSelectedOrderId(orderId);
        setIsModalOpen(true);
    };

    const handleDateChange = (date: Date) => {
        setSelectedDate(getPreviousSunday(date));
        setCurrentPage(1);
    };

    if (isLoading) {
        return <TableSkeleton columns={5} rows={10} />;
    }

    if (error) { // Use the new component for error display
        return <ErrorAlert error={error} title="Error loading meals" />;
    }


    return (
        <>
            <PageBreadcrumb pageTitle="Orders" />
            <div className="mb-4">
                <DatePickerCustom
                    id="weekstart-date-picker"
                    selected={selectedDate}
                    onChange={handleDateChange}
                    enableSundaysOnly={true}
                />
            </div>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="max-w-full overflow-x-auto">
                    <div className="min-w-[1102px]">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                    >
                                        Order ID
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                    >
                                        Customer
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                    >
                                        Order Date
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                    >
                                        Total
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                    >
                                        Actions
                                    </TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {data?.data.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell className="px-5 py-4 text-gray-800 text-start dark:text-white/90">
                                            {order.id}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-gray-500 text-start dark:text-gray-400">
                                            {order.name}<br />
                                            {order.email}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-gray-500 text-start dark:text-gray-400">
                                            {order.orderDate}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-gray-500 text-start dark:text-gray-400">
                                            {order.total}
                                        </TableCell>
                                        <TableCell className="px-5 py-4 text-start">
                                            <Button variant="primary" size="sm" onClick={() => handleViewDetails(order.id)}>
                                                <Eye size={16} />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
            <div className="flex justify-center mt-4">
                {data && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={data.totalPages}
                        onPageChange={setCurrentPage}
                    />
                )}
            </div>
            {selectedOrderId !== null && (
                <OrderDetailsModal
                    isOpen={!!selectedOrderId}
                    onClose={() => setSelectedOrderId(null)}
                    orderId={selectedOrderId}
                />
            )}
        </>
    );
};

export default OrdersTable;