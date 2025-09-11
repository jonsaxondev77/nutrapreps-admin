"use client";
import React, { useState, useMemo } from "react";
import { useGetCustomersQuery } from "@/lib/services/customersApi";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Pagination from "@/components/tables/Pagination";
import Button from "@/components/ui/button/Button";
import TableSkeleton from "@/components/tables/TableSkeleton";
import ErrorAlert from "@/components/common/ErrorAlert";
import { Account, AccountStatus } from "@/types/customers";
import AssignStripeIdModal from "./AssignStripeIdModal"; // Import the new modal

export default function StripeAnomaliesTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20000); 
  const { data, error, isLoading } = useGetCustomersQuery({
    pageNumber: 1,
    pageSize: pageSize,
    status: 'Active'
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Account | null>(null);

  const handleOpenModal = (customer: Account) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedCustomer(null);
    setIsModalOpen(false);
  };

  const filteredData = useMemo(() => {
    if (!data?.data) return [];
    
    // Filter customers not in route 10 or 12 and have no stripeCustomerId
    return data.data.filter(
      (user: Account) =>
        user.routeId !== 10 && user.routeId !== 12 && !user.stripeCustomerId
    );
  }, [data]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * 10;
    const endIndex = startIndex + 10;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / 10);

  if (isLoading) {
    return <TableSkeleton columns={4} rows={10} />;
  }

  if (error) {
    return <ErrorAlert error={error} title="Error loading customers" />;
  }

  return (
    <>
      <PageBreadcrumb pageTitle="Stripe Anomalies" />
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
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Route ID
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
                {paginatedData.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="px-5 py-4 text-gray-800 text-start dark:text-white/90">
                      {`${customer.firstName} ${customer.lastName}`}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-800 text-start dark:text-white/90">
                      {customer.email}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-800 text-start dark:text-white/90">
                      {customer.routeId}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-800 text-start dark:text-white/90">
                      <Button size="sm" onClick={() => handleOpenModal(customer)}>Assign Stripe ID</Button>
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
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
      {selectedCustomer && (
        <AssignStripeIdModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          customer={selectedCustomer}
        />
      )}
    </>
  );
}