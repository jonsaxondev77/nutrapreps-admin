"use client";
import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { useCreateMealMutation, useUpdateMealMutation } from "@/lib/services/mealsApi";
import { mealSchema, type MealFormData } from "@/lib/validators/mealValidator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import TextArea from "@/components/form/input/TextArea";

interface Meal {
  id: number;
  name: string;
  description: string;
  fat: string;
  carbs: string;
  protein: string;
  calories: string;
  allergies: string | null;
  supplement: number | null;
}

interface MealModalProps {
  isOpen: boolean;
  onClose: () => void;
  meal: Meal | null;
  mode: 'edit' | 'create';
}

export default function MealModal({
  isOpen,
  onClose,
  meal,
  mode = 'edit',
}: MealModalProps) {
  const [updateMeal, { isLoading: isUpdating }] = useUpdateMealMutation();
  const [createMeal, { isLoading: isCreating }] = useCreateMealMutation();
  const isLoading = isUpdating || isCreating;

  const {
    setValue,
    watch,
    trigger,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MealFormData>({
    resolver: zodResolver(mealSchema),
    mode: "onChange",
  });

  const formValues = watch();

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && meal) {
        reset({
            ...meal,
            supplement: meal.supplement || 0
        });
      } else {
        reset({
          name: "",
          description: "",
          calories: "",
          carbs: "",
          protein: "",
          fat: "",
          allergies: "",
          supplement: 0,
        });
      }
    }
  }, [meal, isOpen, reset, mode]);

  const handleInputChange = (field: keyof MealFormData, value: string | number) => {
    setValue(field, value as any);
    trigger(field);
  };

  const onSubmit = async (data: MealFormData) => {
    try {
      if (mode === 'edit' && meal) {
        await updateMeal({ id: meal.id, ...data }).unwrap();
      } else {
        await createMeal(data).unwrap();
      }
      onClose();
    } catch (error) {
      console.error(`Failed to ${mode} meal:`, error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[584px] p-5 lg:p-10">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
          {mode === 'edit' ? 'Edit Meal' : 'Create New Meal'}
        </h4>
        <div className="space-y-6">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              defaultValue={formValues.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              onBlur={() => trigger("name")}
              error={!!errors.name}
              hint={errors.name?.message}
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <TextArea
              value={formValues.description || ""}
              onChange={(value) => handleInputChange("description", value)}
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="calories">Calories</Label>
            <Input
              id="calories"
              type="text"
              defaultValue={formValues.calories}
              onChange={(e) => handleInputChange("calories", e.target.value)}
              onBlur={() => trigger("calories")}
              error={!!errors.calories}
              hint={errors.calories?.message}
            />
          </div>
          <div>
            <Label htmlFor="carbs">Carbs</Label>
            <Input
              id="carbs"
              type="text"
              defaultValue={formValues.carbs}
              onChange={(e) => handleInputChange("carbs", e.target.value)}
              onBlur={() => trigger("carbs")}
              error={!!errors.carbs}
              hint={errors.carbs?.message}
            />
          </div>
          <div>
            <Label htmlFor="protein">Protein</Label>
            <Input
              id="protein"
              type="text"
              defaultValue={formValues.protein}
              onChange={(e) => handleInputChange("protein", e.target.value)}
              onBlur={() => trigger("protein")}
              error={!!errors.protein}
              hint={errors.protein?.message}
            />
          </div>
          <div>
            <Label htmlFor="fat">Fat</Label>
            <Input
              id="fat"
              type="text"
              defaultValue={formValues.fat}
              onChange={(e) => handleInputChange("fat", e.target.value)}
              onBlur={() => trigger("fat")}
              error={!!errors.fat}
              hint={errors.fat?.message}
            />
          </div>
        </div>
        <div className="flex items-center justify-end w-full gap-3 mt-6">
          <Button size="sm" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" disabled={isLoading}>
            {isLoading ? (mode === 'edit' ? "Saving..." : "Creating...") : (mode === 'edit' ? "Save Changes" : "Create Meal")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}