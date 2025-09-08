"use client";
import React from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { useCreateStripeCustomerMutation } from "@/lib/services/customersApi";
import { Account } from "@/types/customers";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface AssignStripeIdModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Account | null;
}

export default function AssignStripeIdModal({ isOpen, onClose, customer }: AssignStripeIdModalProps) {
  const [createStripeCustomer, { isLoading }] = useCreateStripeCustomerMutation();

  const handleAssign = async () => {
    if (!customer || !customer.firstName || !customer.lastName || !customer.email) {
      toast.error("Customer information is incomplete.");
      return;
    }
    
    const name = `${customer.firstName} ${customer.lastName}`;
    const { id: accountId, email } = customer;

    try {
      await toast.promise(
        createStripeCustomer({ accountId, name, email }).unwrap(),
        {
          loading: "Creating Stripe customer...",
          success: "Stripe customer created and assigned!",
          error: (err) => `Failed to assign Stripe ID: ${err.message || 'Unknown error'}`,
        }
      );
      onClose();
    } catch (error) {
      console.error("Failed to assign Stripe ID:", error);
    }
  };
  
  if (!isOpen || !customer) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[700px] p-5 lg:p-10">
      <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">Assign Stripe Customer ID</h4>
      <div className="space-y-4">
        <p className="text-gray-600 dark:text-gray-300">
          This will create a new customer record in Stripe for:
        </p>
        <p className="font-medium text-gray-800 dark:text-white/90">
          Name: {customer.firstName} {customer.lastName}
        </p>
        <p className="font-medium text-gray-800 dark:text-white/90">
          Email: {customer.email}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          A new Stripe Customer ID will be generated and saved to this account.
        </p>
      </div>
      <div className="flex items-center justify-end w-full gap-3 mt-6">
        <Button size="sm" variant="outline" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button size="sm" disabled={isLoading} onClick={handleAssign}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Assigning...
            </>
          ) : (
            "Confirm and Assign"
          )}
        </Button>
      </div>
    </Modal>
  );
}