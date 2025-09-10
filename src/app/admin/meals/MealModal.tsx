// src/app/admin/meals/MealModal.tsx
"use client";
import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import InputFieldCustom from "@/components/form/input/InputFieldCustom";
import Label from "@/components/form/Label";
import { useCreateMealMutation, useUpdateMealMutation } from "@/lib/services/mealsApi";
import { mealSchema, type MealFormData } from "@/lib/validators/mealValidator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import TextAreaCustom from "@/components/form/input/TextAreaCustom";
import Image from "next/image";
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { FileSelector } from '@/components/file-manager/FileSelector';
import { Image as ImageIcon } from 'lucide-react';

interface Meal {
    id: number;
    name: string;
    description: string | null;
    fat: string;
    carbs: string;
    protein: string;
    calories: string;
    allergies: string | null;
    supplement: number | null;
    stripeProductId?: string;
    imageUrl?: string | null;
    spiceRating?: number | null; // Updated type definition to include spiceRating
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

    const [isFileModalOpen, setIsFileModalOpen] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        control,
        setValue
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
                    imageUrl: meal.imageUrl || "",
                    spiceRating: meal.spiceRating || null, // Added spiceRating here
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
                    imageUrl: "",
                    spiceRating: null, // Added spiceRating here
                });
            }
        }
    }, [meal, isOpen, reset, mode]);

    const handleFileSelect = (file: { FullPath: string; IsDirectory: boolean }) => {
        if (file.IsDirectory) {
            toast.error("Please select a file, not a directory.");
            return;
        }

        const PULL_ZONE_URL = process.env.NEXT_PUBLIC_BUNNY_CDN_PULL_ZONE_HOSTNAME;
        if (!PULL_ZONE_URL) {
            toast.error("BunnyCDN pull zone URL is not configured.");
            return;
        }

        const fileUrl = `https://${PULL_ZONE_URL}/${file.FullPath}`;
        setValue('imageUrl', fileUrl, { shouldDirty: true });
        setIsFileModalOpen(false);
    };

    const onSubmit = async (data: MealFormData) => {
        try {
            if (mode === 'edit' && meal) {
                let updatedMealData = { ...meal, ...data };
                if (data.supplement && data.supplement > 0 && !meal.stripeProductId) {
                    const response = await fetch('/api/stripe/products', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ productData: data }),
                    });
                    const { product } = await response.json();
                    updatedMealData.stripeProductId = product.id;
                } else if (meal.stripeProductId) {
                    await fetch('/api/stripe/products', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ productData: { ...data, stripeProductId: meal.stripeProductId } }),
                    });
                }
                await updateMeal(updatedMealData).unwrap();
            } else { // Create mode
                let stripeProductId = null;
                if (data.supplement && data.supplement > 0) {
                    const response = await fetch('/api/stripe/products', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ productData: data }),
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
        <>
            <Modal isOpen={isOpen && !isFileModalOpen} onClose={onClose} className="max-w-[584px] p-5 lg:p-10">
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
                        {mode === 'edit' ? 'Edit Meal' : 'Create New Meal'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <Label htmlFor="name">Name</Label>
                            <InputFieldCustom
                                id="name"
                                type="text"
                                {...register("name")}
                                error={!!errors.name}
                                hint={errors.name?.message}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <Label htmlFor="description">Description</Label>
                            <TextAreaCustom
                                id="description"
                                {...register("description")}
                                rows={3}
                                error={!!errors.description}
                                hint={errors.description?.message}
                            />
                        </div>
                        <Controller
                            name="imageUrl"
                            control={control}
                            render={({ field }) => (
                                <div className="md:col-span-2">
                                    <div className="flex items-end gap-2">
                                        <div className="flex-1">
                                            <InputFieldCustom
                                                id="image-url"
                                                label="Meal Image URL"
                                                type="text"
                                                value={field.value || ""}
                                                onChange={field.onChange}
                                                placeholder="Image URL"
                                                disabled={isLoading}
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            onClick={() => setIsFileModalOpen(true)}
                                            disabled={isLoading}
                                            className="h-10 px-4 py-2"
                                        >
                                            <ImageIcon size={20} className="mr-2" />
                                            Browse
                                        </Button>
                                    </div>
                                    {field.value && (
                                        <div className="relative mt-2 p-2 border rounded-lg w-[300px] h-[300px] overflow-hidden">
                                            <Image 
                                                src={field.value} 
                                                alt="Preview" 
                                                width={300} 
                                                height={300}
                                                className="object-cover w-full h-full rounded" 
                                            />
                                            <button
                                                onClick={() => setValue('imageUrl', '', { shouldDirty: true })}
                                                className="absolute top-5 right-5 p-1 text-red-500 bg-white rounded-full translate-x-1/2 -translate-y-1/2"
                                                aria-label="Remove image"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        />
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
                        <div className="md:col-span-2">
                            <Label htmlFor="allergens">Allergens</Label>
                            <TextAreaCustom
                                id="allergens"
                                {...register("allergies")}
                                rows={3}
                                error={!!errors.allergies}
                                hint={errors.allergies?.message}
                            />
                        </div>
                        <div>
                            <Label htmlFor="spiceRating">Spice Rating (1-5)</Label>
                            <InputFieldCustom
                                id="spiceRating"
                                type="number"
                                {...register("spiceRating", { valueAsNumber: true })}
                                min={0}
                                max={4}
                                error={!!errors.spiceRating}
                                hint={errors.spiceRating?.message}
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
                        <Button size="sm" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button size="sm" disabled={isLoading}>
                            {isLoading ? (mode === 'edit' ? "Saving..." : "Creating...") : (mode === 'edit' ? "Save Changes" : "Create Meal")}
                        </Button>
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={isFileModalOpen}
                onClose={() => setIsFileModalOpen(false)}
                className="max-w-4xl h-[80vh] flex flex-col"
            >
                <FileSelector onClose={() => setIsFileModalOpen(false)} onFileSelect={handleFileSelect} />
            </Modal>
        </>
    );
}