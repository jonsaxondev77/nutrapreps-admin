"use client";
import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import SelectCustom from "@/components/form/SelectCustom";
import Label from "@/components/form/Label";
import { useGetAllRoutesQuery } from "@/lib/services/routesApi";
import { useAssignRouteAndActivateMutation } from "@/lib/services/customersApi";

interface AssignRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountId: string;
}

export default function AssignRouteModal({ isOpen, onClose, accountId }: AssignRouteModalProps) {
  const [selectedRoute, setSelectedRoute] = useState<number | ''>('');
  const { data: routes, isLoading: isLoadingRoutes } = useGetAllRoutesQuery({pageNumber: 1, pageSize: 20});
  const [assignRoute, { isLoading: isAssigning }] = useAssignRouteAndActivateMutation();

 const routeOptions = routes?.data.map(route => ({ value: String(route.id), label: route.name })) || [];


  const handleAssign = async () => {
    if (selectedRoute) {
      await assignRoute({ accountId, routeId: Number(selectedRoute) });
      onClose();
    }
  };
  
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[700px] p-5 lg:p-10">
      <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">Assign Route and Activate</h4>
      <div className="space-y-6">
        <div>
          <Label htmlFor="route">Route</Label>
          <SelectCustom
            id="route"
            options={routeOptions}
            value={selectedRoute}
            onChange={(e) => setSelectedRoute(Number(e.target.value))}
            disabled={isLoadingRoutes}
          />
        </div>
      </div>
      <div className="flex items-center justify-end w-full gap-3 mt-6">
        <Button size="sm" variant="outline" onClick={onClose}>Cancel</Button>
        <Button size="sm" disabled={isAssigning || !selectedRoute} onClick={handleAssign}>
          {isAssigning ? "Assigning..." : "Assign and Activate"}
        </Button>
      </div>
    </Modal>
  );
}