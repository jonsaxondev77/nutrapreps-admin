"use client";
import React from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { useDeleteRouteMutation } from "@/lib/services/routesApi";

interface Route {
  id: number;
  name: string | null;
}

interface DeleteRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  route: Route | null;
  onRouteDeleted?: () => void;
}

export default function DeleteRouteModal({
  isOpen,
  onClose,
  route,
  onRouteDeleted,
}: DeleteRouteModalProps) {
  const [deleteRoute, { isLoading }] = useDeleteRouteMutation();

  const handleDelete = async () => {
    if (!route) return;

    try {
      await deleteRoute(route.id).unwrap();
      onRouteDeleted?.();
      onClose();
    } catch (error) {
      console.error("Failed to delete route:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[484px] p-5 lg:p-8">
      <div>
        <h4 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
          Delete Route
        </h4>
        
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            Are you sure you want to delete the route{" "}
            <span className="font-medium">"{route?.name}"</span>?
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
            {isLoading ? "Deleting..." : "Delete Route"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}