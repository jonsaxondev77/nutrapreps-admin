// src/app/admin/extras/ExtraModal.tsx
"use client";
import React, { useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { useCreateExtraMutation, useUpdateExtraMutation } from "@/lib/services/extrasApi";
import { extraSchema, type ExtraFormData } from "@/lib/validators/extraValidator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import TextArea from "@/components/form/input/TextArea";
import Checkbox from "@/components/form/input/Checkbox";
import CheckboxCustom from "@/components/form/input/CheckboxCustom";
import TextAreaCustom from "@/components/form/input/TextAreaCustom";
import InputFieldCustom from "@/components/form/input/InputFieldCustom";

interface Extra {
  id: number;
  name: string | null;
  price: number;
  allergens: string | null;
  categoryId: number;
  soldOut: boolean;
}

interface ExtraModalProps {
  isOpen: boolean;
  onClose: () => void;
  extra: Extra | null;
  mode: 'edit' | 'create';
}

export default function ExtraModal({
  isOpen,
  onClose,
  extra,
  mode = 'edit',
}: ExtraModalProps) {
  const [updateExtra, { isLoading: isUpdating }] = useUpdateExtraMutation();
  const [createExtra, { isLoading: isCreating }] = useCreateExtraMutation();
  const isLoading = isUpdating || isCreating;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ExtraFormData>({
    resolver: zodResolver(extraSchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && extra) {
        reset({
          name: extra.name || "",
          price: extra.price,
          allergens: extra.allergens || "",
          categoryId: extra.categoryId,
          soldOut: extra.soldOut,
        });
      } else {
        reset({
          name: "",
          price: 0,
          allergens: "",
          categoryId: 0,
          soldOut: false,
        });
      }
    }
  }, [extra, isOpen, reset, mode]);

  const onSubmit = async (data: ExtraFormData) => {
    try {
      if (mode === 'edit' && extra) {
        await updateExtra({ id: extra.id, ...data }).unwrap();
      } else {
        await createExtra(data).unwrap();
      }
      onClose();
    } catch (error) {
      console.error(`Failed to ${mode} extra:`, error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[584px] p-5 lg:p-10">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
          {mode === 'edit' ? 'Edit Extra' : 'Create New Extra'}
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
            <Label htmlFor="price">Price</Label>
            <InputFieldCustom
              id="price"
              type="number"
              {...register("price", { valueAsNumber: true })}
              min={0}
              step={0.01}
              error={!!errors.price}
              hint={errors.price?.message}
            />
          </div>
          <div>
            <Label htmlFor="allergens">Allergens</Label>
            <TextAreaCustom
              id="allergens"
              {...register("allergens")}
              rows={3}
              error={!!errors.allergens}
              hint={errors.allergens?.message}
            />
          </div>
          <div>
            <Label htmlFor="categoryId">Category ID</Label>
            <InputFieldCustom
              id="categoryId"
              type="number"
              {...register("categoryId", { valueAsNumber: true })}
              error={!!errors.categoryId}
              hint={errors.categoryId?.message}
            />
          </div>
          <div>
            <CheckboxCustom
              id="soldOut"
              label="Sold Out"
              {...register("soldOut")}
            />
          </div>
        </div>
        <div className="flex items-center justify-end w-full gap-3 mt-6">
          <Button size="sm" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" disabled={isLoading}>
            {isLoading ? (mode === 'edit' ? "Saving..." : "Creating...") : (mode === 'edit' ? "Save Changes" : "Create Extra")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
