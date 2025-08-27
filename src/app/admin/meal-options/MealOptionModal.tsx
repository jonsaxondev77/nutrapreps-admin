"use client";
import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { useCreateMealOptionMutation, useUpdateMealOptionMutation } from "@/lib/services/mealOptions";
import { useGetAllMealsListQuery } from "@/lib/services/mealsApi";
import { mealOptionSchema, type MealOptionFormData } from "@/lib/validators/mealOptionValidator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Label from "@/components/form/Label";
import InputFieldCustom from "@/components/form/input/InputFieldCustom";
import SelectCustom from "@/components/form/SelectCustom";
import CheckboxCustom from "@/components/form/input/CheckboxCustom";

interface MealOption {
  id: number;
  name: string;
  isAddon: boolean;
  mealId: number;
}

interface MealOptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  mealOption: MealOption | null;
  mode: 'edit' | 'create';
}

export default function MealOptionModal({
  isOpen,
  onClose,
  mealOption,
  mode,
}: MealOptionModalProps) {
  const [updateMealOption, { isLoading: isUpdating }] = useUpdateMealOptionMutation();
  const [createMealOption, { isLoading: isCreating }] = useCreateMealOptionMutation();
  const { data: mealsList = [] } = useGetAllMealsListQuery();
  const isLoading = isUpdating || isCreating;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MealOptionFormData>({
    resolver: zodResolver(mealOptionSchema),
    defaultValues: { name: '', isAddon: false, mealId: 0 }
  });

  const mealOptionsForSelect = mealsList.map(meal => ({ value: String(meal.id), label: meal.name }));

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && mealOption) {
        reset({
          name: mealOption.name,
          isAddon: mealOption.isAddon,
          mealId: mealOption.mealId,
        });
      } else if (mode === 'create') {
        reset({ name: '', isAddon: false, mealId: 0 });
      }
    }
  }, [mealOption, isOpen, reset, mode]);

  const onSubmit = async (data: MealOptionFormData) => {
    try {
      if (mode === 'edit' && mealOption) {
        await updateMealOption({ id: mealOption.id, ...data }).unwrap();
      } else {
        await createMealOption(data).unwrap();
      }
      onClose();
    } catch (error) {
      console.error(`Failed to ${mode} meal option:`, error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[584px] p-5 lg:p-10">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
          {mode === 'edit' ? 'Edit Meal Option' : 'Create New Meal Option'}
        </h4>
        <div className="space-y-6">
            <div>
                <Label htmlFor="name">Name</Label>
                <InputFieldCustom 
                    id="name" 
                    type="text" 
                    {...register('name')}
                    error={!!errors.name} 
                    hint={errors.name?.message} 
                />
            </div>
            
            <div>
                <Label htmlFor="mealId">Meal</Label>
                <SelectCustom 
                    id="mealId"
                    options={mealOptionsForSelect} 
                    {...register('mealId', { valueAsNumber: true })}
                    error={!!errors.mealId}
                    hint={errors.mealId?.message}
                />
            </div>
            <div className="flex items-center gap-4">
                <CheckboxCustom
                    id="isAddon"
                    label="Is Add-on?"
                    {...register('isAddon')}
                />
            </div>
        </div>
        <div className="flex items-center justify-end w-full gap-3 mt-6">
          <Button size="sm" variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button size="sm" disabled={isLoading} type="submit">
            {isLoading ? (mode === 'edit' ? "Saving..." : "Creating...") : (mode === 'edit' ? "Save Changes" : "Create Meal Option")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
