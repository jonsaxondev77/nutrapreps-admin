// src/app/admin/routes/RouteModal.tsx
"use client";
import React, { useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import InputFieldCustom from "@/components/form/input/InputFieldCustom";
import Label from "@/components/form/Label";
import { useUpdateRouteMutation, useCreateRouteMutation } from "@/lib/services/routesApi";
import { routeSchema, type RouteFormData } from "@/lib/validators/routeValidator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

interface Route {
  id: number;
  name: string | null;
  color: string | null;
  textColor: string | null;
  deliveryFee: number;
  depotId: string | null;
}

interface RouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  route: Route | null;
  mode: 'edit' | 'create';
}

export default function RouteModal({
  isOpen,
  onClose,
  route,
  mode = 'edit',
}: RouteModalProps) {
  const [updateRoute, { isLoading: isUpdating }] = useUpdateRouteMutation();
  const [createRoute, { isLoading: isCreating }] = useCreateRouteMutation();
  const isLoading = isUpdating || isCreating;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RouteFormData>({
    resolver: zodResolver(routeSchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && route) {
        reset({
          name: route.name || "",
          color: route.color || "",
          textColor: route.textColor || "",
          deliveryFee: route.deliveryFee,
          depotId: route.depotId || "",
        });
      } else {
        reset({
          name: "",
          color: "",
          textColor: "",
          deliveryFee: 0,
          depotId: "",
        });
      }
    }
  }, [route, isOpen, reset, mode]);

  const onSubmit = async (data: RouteFormData) => {
    try {
      if (mode === 'edit' && route) {
        await updateRoute({
          id: route.id,
          ...data,
          color: data.color || null,
          textColor: data.textColor || null,
        }).unwrap();
      } else if (mode === 'create') {
        await createRoute({
          id: 0,
          ...data,
          color: data.color || null,
          textColor: data.textColor || null,
        }).unwrap();
      }
      onClose();
    } catch (error) {
      console.error(`Failed to ${mode} route:`, error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[584px] p-5 lg:p-10">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
          {mode === 'edit' ? 'Edit Route' : 'Create New Route'}
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
            <Label htmlFor="color">Color</Label>
            <InputFieldCustom
              id="color"
              type="text"
              {...register("color")}
              placeholder="#FF0000"
              error={!!errors.color}
              hint={errors.color?.message || "Enter a hex color code (e.g., #FF0000)"}
            />
          </div>
          <div>
            <Label htmlFor="textColor">Text Color</Label>
            <InputFieldCustom
              id="textColor"
              type="text"
              {...register("textColor")}
              placeholder="#FFFFFF"
              error={!!errors.textColor}
              hint={errors.textColor?.message || "Enter a hex color code (e.g., #FFFFFF)"}
            />
          </div>
          <div>
            <Label htmlFor="deliveryFee">Delivery Fee</Label>
            <InputFieldCustom
              id="deliveryFee"
              type="number"
              {...register("deliveryFee", { valueAsNumber: true })}
              min={0}
              step={0.01}
              error={!!errors.deliveryFee}
              hint={errors.deliveryFee?.message}
            />
          </div>
          <div>
            <Label htmlFor="depotId">Depot ID</Label>
            <InputFieldCustom
              id="depotId"
              type="text"
              {...register("depotId")}
              error={!!errors.depotId}
              hint={errors.depotId?.message}
            />
          </div>
        </div>
        <div className="flex items-center justify-end w-full gap-3 mt-6">
          <Button size="sm" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            size="sm" 
            disabled={isLoading}
          >
            {isLoading 
              ? (mode === 'edit' ? "Saving..." : "Creating...") 
              : (mode === 'edit' ? "Save Changes" : "Create Route")
            }
          </Button>
        </div>
      </form>
    </Modal>
  );
}
