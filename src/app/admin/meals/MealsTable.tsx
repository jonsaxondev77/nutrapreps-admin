"use client";
import React, { useState } from "react";
import { useGetAllMealsQuery } from "@/lib/services/mealsApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Pagination from "@/components/tables/Pagination";

export default function MealsTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const { data, error, isLoading } = useGetAllMealsQuery({
    pageNumber: currentPage,
    pageSize: 10,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading meals</div>;

  return (
    <>
      <PageBreadcrumb pageTitle="Meals" />
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
                    Description
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {data?.data.map((meal) => (
                  <TableRow key={meal.id}>
                    <TableCell className="px-5 py-4 text-gray-800 text-start dark:text-white/90">
                      {meal.name}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start dark:text-gray-400">
                      {meal.description}
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
    </>
  );
}