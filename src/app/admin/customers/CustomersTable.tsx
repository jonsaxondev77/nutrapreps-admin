"use client";
import React, { useState } from "react";
import { useGetCustomersQuery, customersApi } from "@/lib/services/customersApi";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Pagination from "@/components/tables/Pagination";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import CustomerModal from "./CustomerModal";
import { Account, AccountStatus } from "@/types/customers";
import TableSkeleton from "@/components/tables/TableSkeleton";
import ErrorAlert from "@/components/common/ErrorAlert";
import InputFieldCustom from "@/components/form/input/InputFieldCustom";
import { useDebounce } from "@/hooks/useDebounce";
import { useDispatch } from "react-redux";
import { SheetIcon } from "lucide-react";
import { AppDispatch } from "@/lib/store";

// Re-usable helper function to convert an array of objects to a CSV string and trigger a download.
const exportToCsv = (data: Account[], filename: string) => {
  if (!data || data.length === 0) {
    alert('No data to export.');
    return;
  }
  const headers = ['firstName', 'lastName', 'telephone'];
  const rows = data.map(customer => {
    const values = headers.map(header => {
      // @ts-ignore
      const value = customer[header];
      return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
    });
    return values.join(',');
  });
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function CustomersTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  const { data, error, isLoading, isFetching } = useGetCustomersQuery({
    pageNumber: currentPage,
    pageSize: pageSize,
    status: statusFilter,
    searchTerm: debouncedSearchTerm,
  });

  const dispatch = useDispatch<AppDispatch>();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Account | null>(null);

  const statusOptions = [
    { value: 'All', label: 'All' },
    { value: AccountStatus.Active, label: 'Active' },
    { value: AccountStatus.Inactive, label: 'Inactive' },
    { value: AccountStatus.Registered, label: 'Registered' },
    { value: AccountStatus.EmailVerified, label: 'Email Verified' },
    { value: AccountStatus.InfoCompleted, label: 'Info Completed' },
    { value: AccountStatus.Rejected, label: 'Rejected' },
  ];

  const handleEditClick = (customer: Account) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(event.target.value));
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(event.target.value);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };
  
  const handleExportActiveAccounts = async () => {
    try {
      // Use dispatch and the initiate method to call the API on demand
      const { data: activeCustomersData } = await dispatch(
        customersApi.endpoints.getCustomers.initiate({
          pageNumber: 1,
          pageSize: 100000, // Use a large number to get all records
          status: AccountStatus.Active,
          searchTerm: ''
        })
      ).unwrap();

      console.log(activeCustomersData.length);
      
      if (activeCustomersData && activeCustomersData &&activeCustomersData.length > 0) {
        exportToCsv(activeCustomersData, 'active_customers.csv');
      } else {
        alert('No active accounts found to export.');
      }
    } catch (err) {
      console.error('Failed to fetch customers for export:', err);
      alert('Failed to export customers.');
    }
  };

  if (isLoading) {
    return <TableSkeleton columns={4} rows={10} />;
  }

  if (error) {
    return <ErrorAlert error={error} title="Error loading customers" />;
  }

  const customersToDisplay = data?.data || [];

  return (
    <>
      <PageBreadcrumb pageTitle="Customers" />
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex w-full sm:w-auto flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            
            <div className="w-full sm:w-60">
                <InputFieldCustom
                    id="search"
                    type="text"
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClear={handleClearSearch}
                    isFetching={isFetching}
                />
            </div>
             <div>
                <label htmlFor="statusFilter" className="sr-only">Status Filter</label>
                <select
                    id="statusFilter"
                    value={statusFilter}
                    onChange={handleStatusFilterChange}
                    className="rounded-md border border-gray-300 bg-white px-2 py-1 dark:border-gray-700 dark:bg-gray-800 dark:text-white h-11 w-full sm:w-40"
                >
                    {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
            </div>
            {/* New export button */}
            <Button onClick={handleExportActiveAccounts} variant="primary" className="h-11">
                <SheetIcon className="h-5 w-5 mr-2" />
                Export Active
            </Button>
        </div>
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
            </select>
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1102px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Name</TableCell>
                  <TableCell isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Email</TableCell>
                  <TableCell isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                  <TableCell isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {customersToDisplay.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="px-5 py-4 text-gray-800 text-start dark:text-white/90">{`${customer.firstName} ${customer.lastName}`}</TableCell>
                    <TableCell className="px-5 py-4 text-gray-800 text-start dark:text-white/90">{customer.email}</TableCell>
                    <TableCell className="px-5 py-4 text-gray-800 text-start dark:text-white/90">
                      <Badge variant={customer.status === 'Active' ? 'solid' : 'light'}>
                        {customer.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-800 text-start dark:text-white/90">
                      <Button size="sm" variant="primary" onClick={() => handleEditClick(customer)}>
                        Edit
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

      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        customer={selectedCustomer}
      />
    </>
  );
}