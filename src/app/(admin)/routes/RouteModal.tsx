"use client";
import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
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
  const [previousRouteId, setPreviousRouteId] = useState<number | null>(null);

  const isLoading = isUpdating || isCreating;

  const {
    setValue,
    watch,
    trigger,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RouteFormData>({
    resolver: zodResolver(routeSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      color: "",
      textColor: "",
      deliveryFee: 0,
      depotId: "",
    }
  });

  const formValues = watch();

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && route) {
        // Check if we're opening a different route than the previous one
        if (route.id !== previousRouteId) {
          const newDefaultValues = {
            name: route.name || "",
            color: route.color || "",
            textColor: route.textColor || "",
            deliveryFee: route.deliveryFee,
            depotId: route.depotId || "",
          };
          reset(newDefaultValues);
          setPreviousRouteId(route.id);
        }
      } else if (mode === 'create') {
        // Reset to empty form for create mode
        reset({
          name: "",
          color: "",
          textColor: "",
          deliveryFee: 0,
          depotId: "",
        });
        setPreviousRouteId(null);
      }
    } else {
      // Reset when modal closes
      reset({
        name: "",
        color: "",
        textColor: "",
        deliveryFee: 0,
        depotId: "",
      });
      setPreviousRouteId(null);
    }
  }, [route, isOpen, reset, previousRouteId, mode]);

  const handleInputChange = async (field: keyof RouteFormData, value: string | number) => {
    setValue(field, value);
    await trigger(field);
  };

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

  const handleClose = () => {
    reset({
      name: "",
      color: "",
      textColor: "",
      deliveryFee: 0,
      depotId: "",
    });
    setPreviousRouteId(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-[584px] p-5 lg:p-10">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
          {mode === 'edit' ? 'Edit Route' : 'Create New Route'}
        </h4>
        <div className="space-y-6">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              defaultValue={formValues.name || ""}
              onChange={(e) => handleInputChange("name", e.target.value)}
              onBlur={() => trigger("name")}
              error={!!errors.name}
              hint={errors.name?.message}
            />
          </div>
          <div>
            <Label htmlFor="color">Color</Label>
            <Input
              id="color"
              type="text"
              defaultValue={formValues.color || ""}
              onChange={(e) => handleInputChange("color", e.target.value)}
              onBlur={() => trigger("color")}
              placeholder="#FF0000"
              error={!!errors.color}
              hint={errors.color?.message || "Enter a hex color code (e.g., #FF0000)"}
            />
          </div>
          <div>
            <Label htmlFor="textColor">Text Color</Label>
            <Input
              id="textColor"
              type="text"
              defaultValue={formValues.textColor || ""}
              onChange={(e) => handleInputChange("textColor", e.target.value)}
              onBlur={() => trigger("textColor")}
              placeholder="#FFFFFF"
              error={!!errors.textColor}
              hint={errors.textColor?.message || "Enter a hex color code (e.g., #FFFFFF)"}
            />
          </div>
          <div>
            <Label htmlFor="deliveryFee">Delivery Fee</Label>
            <Input
              id="deliveryFee"
              type="number"
              defaultValue={formValues.deliveryFee || 0}
              onChange={(e) => handleInputChange("deliveryFee", parseFloat(e.target.value) || 0)}
              onBlur={() => trigger("deliveryFee")}
              min={0}
              step={0.01}
              error={!!errors.deliveryFee}
              hint={errors.deliveryFee?.message}
            />
          </div>
          <div>
            <Label htmlFor="depotId">Depot ID</Label>
            <Input
              id="depotId"
              type="text"
              defaultValue={formValues.depotId || ""}
              onChange={(e) => handleInputChange("depotId", e.target.value)}
              onBlur={() => trigger("depotId")}
              error={!!errors.depotId}
              hint={errors.depotId?.message}
            />
          </div>
        </div>
        <div className="flex items-center justify-end w-full gap-3 mt-6">
          <Button size="sm" variant="outline" onClick={handleClose}>
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