"use client";

import { useGetOrdersQuery } from "@/lib/services/ordersApi";
import { useState } from "react";
import { OrderListResponse } from "@/types/orders";
import { useSendBulkWhatsAppMessageMutation } from "@/lib/services/whatsAppApi";
import Button from "../ui/button/Button";
import { Modal } from "../ui/modal";


interface SendWeeklyReminderProps {
  selectedDate: Date;
}

export default function SendWeeklyReminder({ selectedDate }: SendWeeklyReminderProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const getPreviousWeekStart = () => {
    const d = new Date(selectedDate.getTime());
    d.setUTCDate(d.getUTCDate() - 6);
    d.setUTCHours(0, 0, 0, 0);
    return d.toISOString();
  };

  const formattedWeekStart = new Date(getPreviousWeekStart()).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const { data: ordersData, isLoading: isOrdersLoading, error: ordersError } = useGetOrdersQuery({
    pageNumber: 1,
    pageSize: 1000,
    weekStart: getPreviousWeekStart()
  });

  const [sendBulkMessages] = useSendBulkWhatsAppMessageMutation();

  const handleOpenConfirmation = () => {
    setError(null);
    setSuccess(null);
    if (!ordersData || !ordersData.data || ordersData.data.length === 0) {
      setError("No valid orders found for the previous week to send a reminder.");
      return;
    }
    setIsConfirmModalOpen(true);
  };

  const handleConfirmSend = async () => {
    setIsConfirmModalOpen(false);
    setLoading(true);
    setError(null);
    setSuccess(null);

    const phoneNumbers = ordersData!.data.map(order => order.telephone).filter(Boolean) as string[];

    const message = "Hi! Just a friendly reminder that our new weekly menu is now available for ordering. Place your order now to get your meals for the coming week!";

    try {
      const response = await sendBulkMessages({ phoneNumbers, message }).unwrap();
      const successCount = response.successfulSends.length;
      const failCount = response.failedSends.length;
      setSuccess(`Sent messages to ${successCount} customers. Failed to send to ${failCount}.`);
    } catch (err) {
      setError("Failed to send some messages. Check the console for details.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsConfirmModalOpen(false);
  };

  const customerCount = ordersData?.data.length || 0;

  return (
    <>
      <div className="flex items-center space-x-4">
        <Button size="sm" onClick={handleOpenConfirmation} disabled={isOrdersLoading || loading || customerCount === 0}>
          {loading ? "Sending..." : "Send Weekly Reminder"}
        </Button>
        {isOrdersLoading && <p>Loading orders...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}
      </div>

      <Modal
        isOpen={isConfirmModalOpen}
        onClose={handleCloseModal}
        title="Confirm Weekly Reminder"
        description=""
      >
        <p className="text-gray-600 dark:text-gray-400">
          This will send a WhatsApp reminder to **{customerCount}** customers who placed an order during the week of **{formattedWeekStart}**.
        </p>
        <div className="mt-6 flex justify-end space-x-2">
          <Button variant="outline" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirmSend}>
            Confirm Send
          </Button>
        </div>
      </Modal>
    </>
  );
}