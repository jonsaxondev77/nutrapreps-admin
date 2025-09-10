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
import Button from "@/components/ui/button/Button";
import { PencilIcon } from "@/icons";
import MealModal from "./MealModal";
import DeleteMealModal from "./DeleteModal";
import TableSkeleton from "@/components/tables/TableSkeleton";
import ErrorAlert from "@/components/common/ErrorAlert";

interface Meal {
  id: number;
  name: string;
  description: string;
  fat: string;
  carbs: string;
  protein: string;
  calories: string;
  allergies: string | null;
  spiceRating: number | null;
  supplement: number | null;
  stripeProductId: string | null;
}

export default function MealsTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const { data, error, isLoading } = useGetAllMealsQuery({
    pageNumber: currentPage,
    pageSize: 10,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [modalMode, setModalMode] = useState<'edit' | 'create'>('edit');

  const handleEditClick = (meal: Meal) => {
    setSelectedMeal(meal);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setSelectedMeal(null);
    setModalMode('create');
    setIsModalOpen(true);
  }

  const handleDelete = (meal: Meal) => {
    setSelectedMeal(meal);
    setIsDeleteModalOpen(true);
  };

  const handleMealDeleted = () => {
    // This will be handled by RTK Query's cache invalidation
  };

  if (isLoading) {
    return <TableSkeleton columns={3} rows={10} />;
  }

  if (error) {
    return <ErrorAlert error={error} title="Error loading meals" />;
  }


  return (
    <>
      <PageBreadcrumb pageTitle="Meals" />
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1102px]">
            <div className="flex flex-wrap items-center gap-3 xl:justify-start px-4 py-5 xl:px-6 xl:py-6">
              <Button size="sm" variant="primary" startIcon={<PencilIcon />} onClick={handleAddClick}>Add Meal</Button>
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
                    Description
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
                {data?.data.map((meal) => (
                  <TableRow key={meal.id}>
                    <TableCell className="px-5 py-4 text-gray-800 text-start dark:text-white/90">
                      {meal.name}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start dark:text-gray-400">
                      {meal.description}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                      <div className="flex items-center gap-5">
                        <Button size="sm" onClick={() => handleEditClick(meal)}>
                          Edit
                        </Button>
                        <Button size="sm" onClick={() => handleDelete(meal)}>
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
      <MealModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        meal={selectedMeal}
        mode={modalMode}
      />
      <DeleteMealModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        meal={selectedMeal}
        onMealDeleted={handleMealDeleted}
      />
    </>
  );
}