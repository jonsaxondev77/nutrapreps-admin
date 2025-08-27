// src/app/admin/meals/MealModal.tsx
"use client";
import React, { useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import InputFieldCustom from "@/components/form/input/InputFieldCustom";
import Label from "@/components/form/Label";
import { useCreateMealMutation, useUpdateMealMutation } from "@/lib/services/mealsApi";
import { mealSchema, type MealFormData } from "@/lib/validators/mealValidator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import TextAreaCustom from "@/components/form/input/TextAreaCustom";

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
  stripeProductId?: string;
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
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MealFormData>({
    resolver: zodResolver(mealSchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && meal) {
        reset({
          name: meal.name || "",
          description: meal.description || "",
          calories: meal.calories || "",
          carbs: meal.carbs || "",
          protein: meal.protein || "",
          fat: meal.fat || "",
          allergies: meal.allergies || "",
          supplement: meal.supplement || 0,
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

  const onSubmit = async (data: MealFormData) => {
    try {
      if (mode === 'edit' && meal) {
        let updatedMealData = { ...meal, ...data };

        if (data.supplement && data.supplement > 0 && !meal.stripeProductId) {
          const response = await fetch('/api/stripe/products', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ meal: data }),
          });
          const { product } = await response.json();
          updatedMealData.stripeProductId = product.id;
        } else if (meal.stripeProductId) {
          await fetch('/api/stripe/products', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ meal: { ...data, stripeProductId: meal.stripeProductId } }),
          });
        }

        await updateMeal(updatedMealData).unwrap();

      } else { // Create mode
        let stripeProductId = null;
        if (data.supplement && data.supplement > 0) {
            const response = await fetch('/api/stripe/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ meal: data }),
            });
            const { product } = await response.json();
            stripeProductId = product.id;
        }
        await createMeal({ ...data, stripeProductId }).unwrap();
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
            <InputFieldCustom
              id="name"
              type="text"
              {...register("name")}
              error={!!errors.name}
              hint={errors.name?.message}
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <TextAreaCustom
              id="description"
              {...register("description")}
              rows={3}
              error={!!errors.description}
              hint={errors.description?.message}
            />
          </div>
          <div>
            <Label htmlFor="calories">Calories</Label>
            <InputFieldCustom
              id="calories"
              type="text"
              {...register("calories")}
              error={!!errors.calories}
              hint={errors.calories?.message}
            />
          </div>
          <div>
            <Label htmlFor="carbs">Carbs</Label>
            <InputFieldCustom
              id="carbs"
              type="text"
              {...register("carbs")}
              error={!!errors.carbs}
              hint={errors.carbs?.message}
            />
          </div>
          <div>
            <Label htmlFor="protein">Protein</Label>
            <InputFieldCustom
              id="protein"
              type="text"
              {...register("protein")}
              error={!!errors.protein}
              hint={errors.protein?.message}
            />
          </div>
          <div>
            <Label htmlFor="fat">Fat</Label>
            <InputFieldCustom
              id="fat"
              type="text"
              {...register("fat")}
              error={!!errors.fat}
              hint={errors.fat?.message}
            />
          </div>
          <div>
            <Label htmlFor="supplement">Supplement Price</Label>
            <InputFieldCustom
              id="supplement"
              type="number"
              {...register("supplement", { valueAsNumber: true })}
              error={!!errors.supplement}
              hint={errors.supplement?.message}
            />
          </div>
        </div>
        <div className="flex items-center justify-end w-full gap-3 mt-6">
          <Button size="sm" variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" disabled={isLoading} type="submit">
            {isLoading ? (mode === 'edit' ? "Saving..." : "Creating...") : (mode === 'edit' ? "Save Changes" : "Create Meal")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
