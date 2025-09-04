"use client";
import React, { useState } from "react";
import { useGetCustomersQuery } from "@/lib/services/customersApi";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Pagination from "@/components/tables/Pagination";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import CustomerModal from "./CustomerModal";
import { Account } from "@/types/customers";
import TableSkeleton from "@/components/tables/TableSkeleton";
import ErrorAlert from "@/components/common/ErrorAlert";

export default function CustomersTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const { data, error, isLoading } = useGetCustomersQuery({
    pageNumber: currentPage,
    pageSize: 10,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Account | null>(null);

  const handleEditClick = (customer: Account) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return <TableSkeleton columns={4} rows={10} />;
  }

  if (error) {
    return <ErrorAlert error={error} title="Error loading customers" />;
  }


  return (
    <>
      <PageBreadcrumb pageTitle="Customers" />
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
                {data?.data.map((customer) => (
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