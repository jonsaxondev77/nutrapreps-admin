"use client";
import React from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { useDeleteMealMutation } from "@/lib/services/mealsApi";

interface Meal {
  id: number;
  name: string;
  stripeProductId: string | null;
}

interface DeleteMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  meal: Meal | null;
  onMealDeleted?: () => void;
}

export default function DeleteMealModal({
  isOpen,
  onClose,
  meal,
  onMealDeleted,
}: DeleteMealModalProps) {
  const [deleteMeal, { isLoading }] = useDeleteMealMutation();

  const handleDelete = async () => {
    if (!meal) return;

    try {
      await deleteMeal(meal.id).unwrap();
      onMealDeleted?.();
      onClose();
    } catch (error) {
      console.error("Failed to delete meal:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[484px] p-5 lg:p-8">
      <div>
        <h4 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
          Delete Meal
        </h4>
        
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            Are you sure you want to delete the meal{" "}
            <span className="font-medium">"{meal?.name}"</span>?
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This action cannot be undone. All associated data will be permanently removed.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete Meal"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}