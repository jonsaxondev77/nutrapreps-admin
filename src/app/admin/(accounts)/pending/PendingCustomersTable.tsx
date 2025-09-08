// src/app/admin/(accounts)/pending/PendingCustomersTable.tsx
"use client";
import React, { useState } from "react";
import { useGetPendingUsersQuery } from "@/lib/services/customersApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Pagination from "@/components/tables/Pagination";
import Button from "@/components/ui/button/Button";
import AssignRouteModal from "./AssignRouteModal";
import TableSkeleton from "@/components/tables/TableSkeleton";
import ErrorAlert from "@/components/common/ErrorAlert";

// Helper function to format the address object into a comma-separated string
const formatAddress = (address: any) => {
    if (!address) return '';
    const addressParts = [
        address.line1,
        address.line2,
        address.line3,
        address.postcode,
    ];
    // Filter out any falsy values (null, '', etc.) and join with a comma and space
    return addressParts.filter(Boolean).join(', ');
};

export default function PendingCustomersTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState(10); // Added state for page size

  const { data, error, isLoading } = useGetPendingUsersQuery({
    pageNumber: currentPage,
    pageSize: pageSize, // Using pageSize in the query
  });

  const handleOpenModal = (accountId: string) => {
    setSelectedAccountId(accountId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedAccountId(null);
    setIsModalOpen(false);
  };

  // Added handler for page size change
  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(event.target.value));
    setCurrentPage(1); // Reset to page 1 when page size changes
  };


  if (isLoading) {
    return <TableSkeleton columns={3} rows={pageSize} />;
  }


  if (error) { 
    return <ErrorAlert error={error} title="Error loading pending customers" />;
  }

  return (
    <>
      <PageBreadcrumb pageTitle="Pending Customers" />
      {/* Added a new div for the page size dropdown */}
      <div className="mb-4 flex justify-end items-center">
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
                <option value={150}>150</option>
                <option value={200}>200</option>
                <option value={500}>500</option>
                <option value={1000}>1000</option>
            </select>
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
                    Name
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Email
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Address
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
                {data?.data.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="px-5 py-4 text-gray-800 text-start dark:text-white/90">
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start dark:text-gray-400">
                      {user.email}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start dark:text-gray-400">
                      {formatAddress(user.address)}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                      <div className="flex items-center gap-5">
                        <Button
                          size="sm"
                          onClick={() => handleOpenModal(user.id)}
                        >
                          Assign Route
                        </Button>
                      </div>
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
      {selectedAccountId && (
        <AssignRouteModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          accountId={selectedAccountId}
        />
      )}
    </>
  );
}