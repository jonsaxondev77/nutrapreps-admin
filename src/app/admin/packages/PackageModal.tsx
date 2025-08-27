// src/app/admin/packages/PackageModal.tsx
"use client";
import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import { useCreatePackageMutation, useUpdatePackageMutation } from "@/lib/services/packagesApi";
import { packageSchema, type PackageFormData } from "@/lib/validators/packageValidator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import InputFieldCustom from "@/components/form/input/InputFieldCustom";
import TextAreaCustom from "@/components/form/input/TextAreaCustom";


interface Package {
  id: number;
  name: string;
  description?: string;
  price: number;
  mealsPerWeek: number;
  stripeProductId?: string;
}

interface PackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  pkg: Package | null;
  mode: 'edit' | 'create';
}

export default function PackageModal({ isOpen, onClose, pkg, mode }: PackageModalProps) {
  const [createPackage, { isLoading: isCreating }] = useCreatePackageMutation();
  const [updatePackage, { isLoading: isUpdating }] = useUpdatePackageMutation();
  const isLoading = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PackageFormData>({
    resolver: zodResolver(packageSchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && pkg) {
        reset({
          name: pkg.name || "",
          description: pkg.description || "",
          price: pkg.price || 0,
          mealsPerWeek: pkg.mealsPerWeek || 0,
          stripeProductId: pkg.stripeProductId || null,
        });
      } else {
        reset({
          name: "",
          description: "",
          price: 0,
          mealsPerWeek: 0,
          stripeProductId: null,
        });
      }
    }
  }, [pkg, isOpen, reset, mode]);

  const handleFormSubmit: SubmitHandler<PackageFormData> = async (data) => {
    try {
      const productPayload = {
        name: data.name,
        description: data.description,
        price: data.price, // Use price from form data for Stripe
      };

      if (mode === 'edit' && pkg) {
        let updatedPackageData = { ...pkg, ...data };

        if (data.price !== pkg.price || !pkg.stripeProductId) {
          const method = pkg.stripeProductId ? 'PUT' : 'POST';
          const response = await fetch('/api/stripe/products', {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productData: { ...productPayload, stripeProductId: pkg.stripeProductId } }),
          });

          if (!response.ok) {
            const errorBody = await response.text();
            console.error("Stripe API error:", response.status, errorBody);
            throw new Error('Failed to update Stripe product.');
          }

          const { product } = await response.json();
          
          if (!product || !product.id) {
            throw new Error('Invalid response from Stripe product API.');
          }
          updatedPackageData.stripeProductId = product.id;
        }
        
        await updatePackage({
          ...updatedPackageData,
          stripeProductId: updatedPackageData.stripeProductId || undefined,
        }).unwrap();

      } else { // Create mode
        const response = await fetch('/api/stripe/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productData: productPayload }),
        });

        if (!response.ok) {
          const errorBody = await response.text();
          console.error("Stripe API error:", response.status, errorBody);
          throw new Error('Failed to create Stripe product.');
        }
        
        const { product } = await response.json();

        if (!product || !product.id) {
          throw new Error('Invalid response from Stripe product API.');
        }
        
        await createPackage({ 
          ...data, 
          stripeProductId: product.id || undefined 
        }).unwrap();
      }
      onClose();
    } catch (error) {
      console.error(`Failed to ${mode} package:`, error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[584px] p-5 lg:p-10">
      <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
        <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
          {mode === 'edit' ? 'Edit Package' : 'Create New Package'}
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
            <Label htmlFor="price">Price (£)</Label>
            <InputFieldCustom
              id="price"
              type="number"
              step="0.01"
              {...register("price", { valueAsNumber: true })}
              error={!!errors.price}
              hint={errors.price?.message}
            />
          </div>
          <div>
            <Label htmlFor="mealsPerWeek">Meals Per Week</Label>
            <InputFieldCustom
              id="mealsPerWeek"
              type="number"
              {...register("mealsPerWeek", { valueAsNumber: true })}
              error={!!errors.mealsPerWeek}
              hint={errors.mealsPerWeek?.message}
            />
          </div>
        </div>
        <div className="flex items-center justify-end w-full gap-3 mt-6">
          <Button size="sm" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" disabled={isLoading}>
            {isLoading 
              ? (mode === 'edit' ? "Saving..." : "Creating...") 
              : (mode === 'edit' ? "Save Changes" : "Create Package")
            }
          </Button>
        </div>
      </form>
    </Modal>
  );
}
