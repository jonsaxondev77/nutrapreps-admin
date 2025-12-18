import { z } from 'zod';

export const mealOptionSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  isAddon: z.boolean(),
  mealId: z.number().min(1, 'You must select a meal'),
  color: z.string().regex(/^#([0-9A-Fa-f]{3}){1,2}$/),
  allowedDoubleProtein: z.boolean()
});

export type MealOptionFormData = z.infer<typeof mealOptionSchema>;