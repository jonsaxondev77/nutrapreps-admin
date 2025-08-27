"use client";
import React from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { useDeleteMealOptionMutation } from "@/lib/services/mealOptions";

interface MealOption {
  id: number;
  name: string;
}

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  mealOption: MealOption | null;
}

export default function DeleteModal({
  isOpen,
  onClose,
  mealOption,
}: DeleteModalProps) {
  const [deleteMealOption, { isLoading }] = useDeleteMealOptionMutation();

  const handleDelete = async () => {
    if (!mealOption) return;
    try {
      await deleteMealOption(mealOption.id).unwrap();
      onClose();
    } catch (error) {
      console.error("Failed to delete meal option:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[484px] p-5 lg:p-8">
      <div>
        <h4 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
          Delete Meal Option
        </h4>
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300">
            Are you sure you want to delete <span className="font-medium">"{mealOption?.name}"</span>?
          </p>
        </div>
        <div className="flex items-center justify-end gap-3">
          <Button size="sm" variant="outline" type="button" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button size="sm" variant="primary" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}