"use client";
import React from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { useDeleteExtraMutation } from "@/lib/services/extrasApi";

interface Extra {
  id: number;
  name: string;
}

interface DeleteExtraModalProps {
  isOpen: boolean;
  onClose: () => void;
  extra: Extra | null;
  onExtraDeleted?: () => void;
}

export default function DeleteExtraModal({
  isOpen,
  onClose,
  extra,
  onExtraDeleted,
}: DeleteExtraModalProps) {
  const [deleteExtra, { isLoading }] = useDeleteExtraMutation();

  const handleDelete = async () => {
    if (!extra) return;

    try {
      await deleteExtra(extra.id).unwrap();
      onExtraDeleted?.();
      onClose();
    } catch (error) {
      console.error("Failed to delete extra:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[484px] p-5 lg:p-8">
      <div>
        <h4 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
          Delete Extra
        </h4>
        
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            Are you sure you want to delete the extra{" "}
            <span className="font-medium">"{extra?.name}"</span>?
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
            {isLoading ? "Deleting..." : "Delete Extra"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}