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
const formatAddress = (address) => {
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
  const { data, error, isLoading } = useGetPendingUsersQuery({
    pageNumber: currentPage,
    pageSize: 10,
  });

  const handleOpenModal = (accountId: string) => {
    setSelectedAccountId(accountId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedAccountId(null);
    setIsModalOpen(false);
  };


  if (isLoading) {
    return <TableSkeleton columns={3} rows={10} />;
  }


  if (error) { 
    return <ErrorAlert error={error} title="Error loading pending customers" />;
  }

  return (
    <>
      <PageBreadcrumb pageTitle="Pending Customers" />
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