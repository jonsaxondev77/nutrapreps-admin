// src/app/admin/drivers/DriverModal.tsx

'use client';


import Button from '@/components/ui/button/Button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { driverValidator, DriverFormInput } from '@/lib/validators/driverValidator';
import InputFieldCustom from '@/components/form/input/InputFieldCustom';
import Label from '@/components/form/Label'; // Import Label explicitly
import { Driver } from '@/types/drivers';
import { useCreateDriverMutation, useUpdateDriverMutation } from '@/lib/services/driversApi';
import toast from 'react-hot-toast';
import { useEffect } from 'react';
import { Modal } from '@/components/ui/modal';

interface DriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  driver?: Driver | null;
}

const DriverModal: React.FC<DriverModalProps> = ({ isOpen, onClose, driver }) => {
  const isEdit = !!driver;
  const mode = isEdit ? 'edit' : 'create';
  
  const [createDriver, { isLoading: isCreating }] = useCreateDriverMutation();
  const [updateDriver, { isLoading: isUpdating }] = useUpdateDriverMutation();
  const isLoading = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DriverFormInput>({
    resolver: zodResolver(driverValidator),
    defaultValues: {
      firstName: '',
      surname: '',
      emailAddress: '',
      telephoneNumber: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (isEdit && driver) {
        reset({
          firstName: driver.firstName,
          surname: driver.surname,
          emailAddress: driver.emailAddress,
          telephoneNumber: driver.telephoneNumber || '',
        });
      } else {
        reset();
      }
    }
  }, [isOpen, isEdit, driver, reset]);

  const onSubmit = async (data: DriverFormInput) => {
    const payload = {
        ...data,
        telephoneNumber: data.telephoneNumber || null,
    };

    try {
      if (isEdit && driver) {
        await updateDriver({ id: driver.id, data: payload }).unwrap();
        toast.success(`Driver ${data.firstName} updated successfully.`);
      } else {
        await createDriver(payload).unwrap();
        toast.success(`Driver ${data.firstName} created successfully.`);
      }
      onClose();
    } catch (error) {
      toast.error(`Failed to ${mode} driver.`);
      console.error(`Failed to ${mode} driver:`, error);
    }
  };

  return (
    // Apply modal size and padding from MealModal example
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[584px] p-5 lg:p-10">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Title structure from MealModal */}
        <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
            {mode === 'edit' ? 'Edit Driver' : 'Create New Driver'}
        </h4>

        {/* Grid layout from MealModal example */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* First Name */}
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <InputFieldCustom
              id="firstName"
              type="text"
              {...register("firstName")}
              error={!!errors.firstName}
              hint={errors.firstName?.message}
            />
          </div>

          {/* Surname */}
          <div>
            <Label htmlFor="surname">Surname</Label>
            <InputFieldCustom
              id="surname"
              type="text"
              {...register("surname")}
              error={!!errors.surname}
              hint={errors.surname?.message}
            />
          </div>

          {/* Email Address */}
          <div>
            <Label htmlFor="emailAddress">Email Address</Label>
            <InputFieldCustom
              id="emailAddress"
              type="email"
              {...register("emailAddress")}
              error={!!errors.emailAddress}
              hint={errors.emailAddress?.message}
            />
          </div>

          {/* Telephone Number */}
          <div>
            <Label htmlFor="telephoneNumber">Telephone Number (Optional)</Label>
            <InputFieldCustom
              id="telephoneNumber"
              type="tel" // Use tel type
              {...register("telephoneNumber")}
              error={!!errors.telephoneNumber}
              hint={errors.telephoneNumber?.message}
            />
          </div>
          
        </div>
        
        {/* Footer buttons from MealModal example */}
        <div className="flex items-center justify-end w-full gap-3 mt-6">
          <Button size="sm" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button size="sm" type="submit" disabled={isLoading} loading={isLoading}>
            {isLoading ? (mode === 'edit' ? "Saving..." : "Creating...") : (mode === 'edit' ? "Save Changes" : "Create Driver")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default DriverModal;