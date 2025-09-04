// src/app/admin/extras/ExtrasTable.tsx
"use client";
import React, { useState } from "react";
import { useGetAllExtrasQuery } from "@/lib/services/extrasApi";
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
import { PencilIcon } from "@/icons";
import ExtraModal from "./ExtraModal";
import DeleteExtraModal from "./DeleteModal";
import Badge from "@/components/ui/badge/Badge";
import TableSkeleton from "@/components/tables/TableSkeleton";
import ErrorAlert from "@/components/common/ErrorAlert";

interface Extra {
  id: number;
  name: string | null;
  price: number;
  allergens: string | null;
  categoryId: number;
  soldOut: boolean;
}

export default function ExtrasTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const { data, error, isLoading } = useGetAllExtrasQuery({
    pageNumber: currentPage,
    pageSize: 10,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedExtra, setSelectedExtra] = useState<Extra | null>(null);
  const [modalMode, setModalMode] = useState<'edit' | 'create'>('edit');

  const handleEditClick = (extra: Extra) => {
    setSelectedExtra(extra);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setSelectedExtra(null);
    setModalMode('create');
    setIsModalOpen(true);
  }

  const handleDelete = (extra: Extra) => {
    setSelectedExtra(extra);
    setIsDeleteModalOpen(true);
  };

  const handleExtraDeleted = () => {
    // This will be handled by RTK Query's cache invalidation
  };

  if (isLoading) {
    return <TableSkeleton columns={6} rows={10} />;
  }

  if (error) {
    return <ErrorAlert error={error} title="Error loading extras" />;
  }

  return (
    <>
      <PageBreadcrumb pageTitle="Extras" />
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1102px]">
            <div className="flex flex-wrap items-center gap-3 xl:justify-start px-4 py-5 xl:px-6 xl:py-6">
              <Button size="sm" variant="primary" startIcon={<PencilIcon />} onClick={handleAddClick}>Add Extra</Button>
            </div>
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
                    Price
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Allergens
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Category
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Sold Out
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
                {data?.data.map((extra) => (
                  <TableRow key={extra.id}>
                    <TableCell className="px-5 py-4 text-gray-800 text-start dark:text-white/90">
                      {extra.name}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start dark:text-gray-400">
                      £{extra.price.toFixed(2)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start dark:text-gray-400">
                      {extra.allergens}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start dark:text-gray-400">
                      {extra.categoryId}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start">
                      <Badge color={extra.soldOut ? "error" : "success"}>
                        {extra.soldOut ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                      <div className="flex items-center gap-5">
                        <Button size="sm" onClick={() => handleEditClick(extra)}>
                          Edit
                        </Button>
                        <Button size="sm" onClick={() => handleDelete(extra)}>
                          Delete
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
      <ExtraModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        extra={selectedExtra}
        mode={modalMode}
      />
      <DeleteExtraModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        extra={selectedExtra}
        onExtraDeleted={handleExtraDeleted}
      />
    </>
  );
}