"use client";
import React, { useState } from "react";
import { useGetAllMealOptionsQuery } from "@/lib/services/mealOptions";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Pagination from "@/components/tables/Pagination";
import Button from "@/components/ui/button/Button";
import { PencilIcon, PlusIcon } from "@/icons";
import MealOptionModal from "./MealOptionModal";
import DeleteModal from "./DeleteModal";
import Badge from "@/components/ui/badge/Badge";

interface MealOption {
  id: number;
  name: string;
  description: string;
  isAddon: boolean;
  mealId: number;
  meal: {
    id: number;
    name: string;
  }
}

export default function MealOptionsTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const { data, error, isLoading } = useGetAllMealOptionsQuery({
    pageNumber: currentPage,
    pageSize: 10,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMealOption, setSelectedMealOption] = useState<MealOption | null>(null);
  const [modalMode, setModalMode] = useState<'edit' | 'create'>('create');

  const handleEditClick = (mealOption: MealOption) => {
    setSelectedMealOption(mealOption);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setSelectedMealOption(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleDeleteClick = (mealOption: MealOption) => {
    setSelectedMealOption(mealOption);
    setIsDeleteModalOpen(true);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading meal options.</div>;

  return (
    <>
      <PageBreadcrumb pageTitle="Meal Options" />
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-5 xl:px-6 xl:py-6">
            <Button size="sm" variant="primary" startIcon={<PlusIcon />} onClick={handleAddClick}>
                Add Meal Option
            </Button>
        </div>
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1102px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Name</TableCell>
                  <TableCell isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Parent Meal</TableCell>
                  <TableCell isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Type</TableCell>
                  <TableCell isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {data?.data.map((option) => (
                  <TableRow key={option.id}>
                    <TableCell className="px-5 py-4 text-gray-800 text-start dark:text-white/90">{option.name}</TableCell>
                    <TableCell className="px-5 py-4 text-gray-800 text-start dark:text-white/90">{option.meal.name}</TableCell>
                    <TableCell>
                        {option.isAddon 
                            ? <Badge variant="light">Add-on</Badge> 
                            : <Badge variant="solid">Standard</Badge>
                        }
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Button size="sm" variant="primary" onClick={() => handleEditClick(option)}>Edit</Button>
                        <Button size="sm" variant="danger" onClick={() => handleDeleteClick(option)}>Delete</Button>
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

      <MealOptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mealOption={selectedMealOption}
        mode={modalMode}
      />
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        mealOption={selectedMealOption}
      />
    </>
  );
}