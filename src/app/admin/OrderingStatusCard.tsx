// src/app/admin/settings/OrderingStatusCard.tsx
"use client";
import React from "react";
import ComponentCard from "@/components/common/ComponentCard";
import Switch from "@/components/form/switch/Switch";
import { useGetOrderingStatusQuery, useUpdateOrderingStatusMutation } from "@/lib/services/settingsApi";
import toast from "react-hot-toast";

export default function OrderingStatusCard() {
  const { data, isLoading, isError } = useGetOrderingStatusQuery();
  const [updateStatus] = useUpdateOrderingStatusMutation();

  const handleToggle = async (isChecked: boolean) => {
    try {
      await toast.promise(
        updateStatus({ isOrderingEnabled: isChecked }).unwrap(),
        {
          loading: "Updating ordering status...",
          success: `Ordering has been ${isChecked ? 'enabled' : 'disabled'}!`,
          error: "Failed to update ordering status.",
        }
      );
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  if (isLoading) {
    return <ComponentCard title="Ordering Status">Loading</ComponentCard>;
  }

  if (isError || !data) {
    return <ComponentCard title="Ordering Status"><p className="text-red-500">Failed to load status.</p></ComponentCard>;
  }

  return (
    <ComponentCard title="Ordering Status" desc="Globally enable or disable customer ordering.">
      <div className="flex justify-between items-center px-4 py-2">
        <p className="text-base font-semibold dark:text-white">
          Ordering is currently: <span className={data.isOrderingEnabled ? "text-green-500" : "text-red-500"}>{data.isOrderingEnabled ? "Enabled" : "Disabled"}</span>
        </p>
        <Switch
          label=""
          color="blue"
          defaultChecked={data.isOrderingEnabled}
          onChange={handleToggle}
        />
      </div>
    </ComponentCard>
  );
}