import { z } from 'zod';

export const mealSchema = z.object({
  name: z.string().min(2, 'Meal name must be at least 2 characters').max(100, 'Meal name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters'),
  calories: z.string().regex(/^\d+kcal$/, "Calories must be in the format 'XXXkcal'"),
  carbs: z.string().regex(/^\d+(\.\d+)?g$/, "Carbs must be in the format 'XXg' or 'XX.Xg'"),
  protein: z.string().regex(/^\d+(\.\d+)?g$/, "Protein must be in the format 'XXg' or 'XX.Xg'"),
  fat: z.string().regex(/^\d+(\.\d+)?g$/, "Fat must be in the format 'XXg' or 'XX.Xg'"),
  doubleCalories: z.string().regex(/^\d+kcal$/, "Calories must be in the format 'XXXkcal'"),
  doubleCarbs: z.string().regex(/^\d+(\.\d+)?g$/, "Carbs must be in the format 'XXg' or 'XX.Xg'"),
  doubleProtein: z.string().regex(/^\d+(\.\d+)?g$/, "Protein must be in the format 'XXg' or 'XX.Xg'"),
  doubleFat: z.string().regex(/^\d+(\.\d+)?g$/, "Fat must be in the format 'XXg' or 'XX.Xg'"),
  spiceRating: z.number().int().min(0).max(4).nullable().optional(),
  allergies: z.string().nullable(),
  supplement: z.number().nullable(),
  imageUrl: z.string().optional().nullable()
});

export type MealFormData = z.infer<typeof mealSchema>;