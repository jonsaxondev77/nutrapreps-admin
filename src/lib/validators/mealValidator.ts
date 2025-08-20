import { z } from 'zod';

export const mealSchema = z.object({
  name: z.string().min(2, 'Meal name must be at least 2 characters').max(100, 'Meal name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').nullable(),
  calories: z.string().regex(/^\d+kcal$/, "Calories must be in the format 'XXXkcal'"),
  carbs: z.string().regex(/^\d+(\.\d+)?g$/, "Carbs must be in the format 'XXg' or 'XX.Xg'"),
  protein: z.string().regex(/^\d+(\.\d+)?g$/, "Protein must be in the format 'XXg' or 'XX.Xg'"),
  fat: z.string().regex(/^\d+(\.\d+)?g$/, "Fat must be in the format 'XXg' or 'XX.Xg'"),
  allergies: z.string().nullable(),
  supplement: z.number().nullable(),
});

export type MealFormData = z.infer<typeof mealSchema>;