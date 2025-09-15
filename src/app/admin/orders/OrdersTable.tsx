'use client';

import { useGetOrdersQuery } from '@/lib/services/ordersApi';
import React, { useState } from 'react';
import Pagination from '@/components/tables/Pagination';
import { CheckCircle, Eye, XCircle, Download } from 'lucide-react';
import OrderDetailsModal from './OrderDetailsModal';
import Button from '@/components/ui/button/Button';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import DatePickerCustom from '@/components/form/date-picker-custom';
import TableSkeleton from '@/components/tables/TableSkeleton';
import ErrorAlert from '@/components/common/ErrorAlert';
import { Dropdown } from '@/components/ui/dropdown/Dropdown';
import { DropdownItem } from '@/components/ui/dropdown/DropdownItem';
import SendWeeklyReminder from "@/components/orders/SendWeeklyReminder";

const getSundayForDate = (date: Date) => {
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
    const [selectedDate, setSelectedDate] = useState(getSundayForDate(new Date()));
    const [pageSize, setPageSize] = useState(10);
    const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);

    const weekStartISO = new Date(Date.UTC(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())).toISOString();

    const { data, error, isLoading } = useGetOrdersQuery({
        pageNumber: currentPage,
        pageSize: pageSize,
        weekStart: weekStartISO,
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

    const handleViewDetails = (orderId: number) => {
        setSelectedOrderId(orderId);
        setIsModalOpen(true);
    };

    const handleDateChange = (date: Date) => {
        setSelectedDate(getSundayForDate(date));
        setCurrentPage(1);
    };

    // NEW: Handle page size change
    const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setPageSize(Number(event.target.value));
        setCurrentPage(1);
    };

    const toggleExportDropdown = () => {
      setIsExportDropdownOpen(prev => !prev);
    };

    const closeExportDropdown = () => {
      setIsExportDropdownOpen(false);
    };

    const exportToCsv = (filteredOrders: any[], filename: string) => {
        if (!filteredOrders || filteredOrders.length === 0) return;

        const headers = ['Order ID', 'Customer Name', 'Email', 'Telephone', 'Total', 'Payment Status'];
        const rows = filteredOrders.map(order => [
            order.id,
            order.name,
            order.email,
            order.telephone,
            order.total,
            order.hasPayment ? 'Paid' : 'Unpaid',
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(e => e.join(',')),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };
    
    const handleExportPaid = () => {
      const paidOrders = data?.data.filter(order => order.hasPayment) || [];
      exportToCsv(paidOrders, 'paid_orders.csv');
      closeExportDropdown();
    };

    const handleExportUnpaid = () => {
      const unpaidOrders = data?.data.filter(order => !order.hasPayment) || [];
      exportToCsv(unpaidOrders, 'unpaid_orders.csv');
      closeExportDropdown();
    };


    if (isLoading) {
        return <TableSkeleton columns={5} rows={10} />;
    }

    if (error) {
        return <ErrorAlert error={error} title="Error loading meals" />;
    }


    return (
        <>
            <PageBreadcrumb pageTitle="Orders" />
            
            {/* NEW: Action Bar */}
            <div className="flex flex-col sm:flex-row sm:justify-end items-start sm:items-end sm:space-x-2 mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-sm">
                <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
                    <div className="relative">
                        <Button 
                            size="sm" 
                            variant="primary" 
                            startIcon={<Download size={16} />} 
                            onClick={toggleExportDropdown}
                            className='dropdown-toggle'
                        >
                            Export
                        </Button>
                        <Dropdown isOpen={isExportDropdownOpen} onClose={closeExportDropdown} className="w-40 mt-1">
                            <DropdownItem onClick={handleExportPaid}>
                                Export Paid
                            </DropdownItem>
                            <DropdownItem onClick={handleExportUnpaid}>
                                Export Unpaid
                            </DropdownItem>
                        </Dropdown>
                    </div>
                </div>
            </div>

            <div className="mb-4 flex flex-col sm:flex-row sm:justify-between items-start sm:items-end">
                <div className="w-full sm:w-auto mb-4 sm:mb-0">
                    <DatePickerCustom
                        id="weekstart-date-picker"
                        selected={selectedDate}
                        onChange={handleDateChange}
                        enableSundaysOnly={true}
                    />
                </div>
                {/* Page Size Dropdown and Export Buttons */}
                <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end sm:space-x-2">
                    <div className="flex items-center space-x-2">
                        <label htmlFor="pageSizeSelect" className="text-gray-600 dark:text-gray-300">
                            Items per page:
                        </label>
                        <select
                            id="pageSizeSelect"
                            value={pageSize}
                            onChange={handlePageSizeChange}
                            className="rounded-md border border-gray-300 bg-white px-2 py-1 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                            <option value={250}>250</option>
                            <option value={500}>500</option>
                            <option value={1000}>1000</option>
                            <option value={1500}>1500</option>
                            <option value={2000}>2000</option>
                        </select>
                    </div>
                </div>
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
                                    {/* NEW: Payment Status Header */}
                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                    >
                                        Payment Status
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
                                        <TableCell className="w-24 px-5 py-4 text-gray-800 text-start dark:text-white/90">
                                            {order.id}
                                        </TableCell>
                                        <TableCell className="w-48 px-4 py-3 text-gray-500 text-start dark:text-gray-400">
                                            {order.name}<br />
                                            {order.email}<br/>
                                            {order.telephone}
                                        </TableCell>
                                        <TableCell className="w-32 px-4 py-3 text-gray-500 text-start dark:text-gray-400">
                                            {order.orderDate}
                                        </TableCell>
                                        <TableCell className="w-32 px-4 py-3 text-gray-500 text-start dark:text-gray-400">
                                            {order.total}
                                        </TableCell>
                                        {/* NEW: Payment Status Cell */}
                                        <TableCell className="w-40 px-4 py-3 text-start">
                                            {order.hasPayment === true ? (
                                                <CheckCircle size={20} className="text-green-500" />
                                            ) : (
                                                <XCircle size={20} className="text-red-500" />
                                            )}
                                        </TableCell>
                                        <TableCell className="w-28 px-5 py-4 text-start">
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