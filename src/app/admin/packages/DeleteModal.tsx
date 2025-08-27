// src/app/admin/packages/DeleteModal.tsx
"use client";
import React from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { useDeletePackageMutation } from "@/lib/services/packagesApi";

interface Package {
  id: number;
  name: string;
}

interface DeletePackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  pkg: Package | null;
  onPackageDeleted?: () => void;
}

export default function DeletePackageModal({
  isOpen,
  onClose,
  pkg,
  onPackageDeleted,
}: DeletePackageModalProps) {
  const [deletePackage, { isLoading }] = useDeletePackageMutation();

  const handleDelete = async () => {
    if (!pkg) return;

    try {
      await deletePackage(pkg.id).unwrap();
      onPackageDeleted?.();
      onClose();
    } catch (error) {
      console.error("Failed to delete package:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[484px] p-5 lg:p-8">
      <div>
        <h4 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
          Delete Package
        </h4>
        
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            Are you sure you want to delete the package{" "}
            <span className="font-medium">"{pkg?.name}"</span>?
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This action cannot be undone.
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
            {isLoading ? "Deleting..." : "Delete Package"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
