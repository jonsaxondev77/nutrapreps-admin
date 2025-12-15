"use client";
import React from "react";
import ComponentCard from "@/components/common/ComponentCard";
import Switch from "@/components/form/switch/Switch";
import { useGetDeliveryAvailabilityQuery, useUpdateDeliveryAvailabilityMutation } from "@/lib/services/settingsApi";
import toast from "react-hot-toast";

export default function DeliveryAvailabilityCard() {
  const { 
    data, 
    isLoading, 
    isError, 
    refetch 
  } = useGetDeliveryAvailabilityQuery();
  const [updateAvailability] = useUpdateDeliveryAvailabilityMutation();

  const handleToggle = async (day: 'Sunday' | 'Wednesday', isChecked: boolean) => {
    // Determine the current state for the other day to ensure we only update one flag at a time
    const updateRequest = {
        isSundayDeliveryEnabled: day === 'Sunday' ? isChecked : data?.isSundayDeliveryEnabled ?? false,
        isWednesdayDeliveryEnabled: day === 'Wednesday' ? isChecked : data?.isWednesdayDeliveryEnabled ?? false,
    };
    
    try {
      await toast.promise(
        updateAvailability(updateRequest).unwrap(),
        {
          loading: `Updating ${day} delivery status...`,
          success: `${day} delivery has been ${isChecked ? 'enabled' : 'disabled'}!`,
          error: `Failed to update ${day} delivery status.`,
        }
      );
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  if (isLoading) {
    return <ComponentCard title="Delivery Availability">Loading Delivery Status...</ComponentCard>;
  }

  if (isError || !data) {
    return <ComponentCard title="Delivery Availability"><p className="text-red-500">Failed to load delivery availability.</p></ComponentCard>;
  }
  
  // Helper to give context that Sunday = Sunday/Monday and Wednesday = Wednesday/Thursday
  const getAdminDisplayDay = (day: 'Sunday' | 'Wednesday') => {
      return day === 'Sunday' ? 'Sunday (Mon. Delivery)' : 'Wednesday (Thu. Delivery)';
  }


  return (
    <ComponentCard title="Delivery Availability" desc="Toggle weekly operational availability for delivery days.">
      <div className="flex flex-col gap-4 my-4">
        {/* Sunday/Monday Delivery Toggle (Internal Day: Sunday) */}
        <div className="flex justify-between items-center px-4 py-2 border rounded-lg">
          <p className="text-base font-semibold dark:text-white">
            {getAdminDisplayDay('Sunday')} is: 
            <span className={data.isSundayDeliveryEnabled ? "text-green-500 ml-1" : "text-red-500 ml-1"}>{data.isSundayDeliveryEnabled ? "Enabled" : "Disabled"}</span>
          </p>
          <Switch
            
            color="green"
            defaultChecked={data.isSundayDeliveryEnabled}
            onChange={(isChecked) => handleToggle('Sunday', isChecked)}
          />
        </div>
        
        {/* Wednesday/Thursday Delivery Toggle (Internal Day: Wednesday) */}
        <div className="flex justify-between items-center px-4 py-2 border rounded-lg">
          <p className="text-base font-semibold dark:text-white">
            {getAdminDisplayDay('Wednesday')} is:
            <span className={data.isWednesdayDeliveryEnabled ? "text-green-500 ml-1" : "text-red-500 ml-1"}>{data.isWednesdayDeliveryEnabled ? "Enabled" : "Disabled"}</span>
          </p>
          <Switch
            
            color="green"
            defaultChecked={data.isWednesdayDeliveryEnabled}
            onChange={(isChecked) => handleToggle('Wednesday', isChecked)}
          />
        </div>
      </div>
    </ComponentCard>
  );
}