'use client';

import Button from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal';
import { useDeleteDriverMutation } from '@/lib/services/driversApi';
import { Driver } from '@/types/drivers';
import { toast } from 'react-hot-toast';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  driver: Driver | null;
}

export const DriversDeleteModal: React.FC<DeleteModalProps> = ({ isOpen, onClose, driver }) => {
  const [deleteDriver, { isLoading }] = useDeleteDriverMutation();

  const handleDelete = async () => {
    if (!driver) return;
    try {
      await deleteDriver(driver.id).unwrap();
      toast.success(`Driver ${driver.firstName} ${driver.surname} deleted successfully.`);
      onClose();
    } catch (error) {
      toast.error('Failed to delete driver.');
      console.error('Delete Driver error:', error);
    }
  };

  if (!driver) return null;

  return (
    // Apply container styling from DeleteMealModal
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[484px] p-5 lg:p-8">
      <div>
        {/* Title structure from DeleteMealModal */}
        <h4 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
          Delete Driver
        </h4>

        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            Are you sure you want to delete the driver{" "}
            <span className="font-medium">
                "{driver.firstName} {driver.surname}"
            </span>?
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This action cannot be undone. All associated data will be permanently removed.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3">
          {/* Cancel Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          
          {/* Delete Button - Using variant="solid" with color="danger" for deletion context */}
          <Button
            size="sm"
            variant="primary"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete Driver"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}