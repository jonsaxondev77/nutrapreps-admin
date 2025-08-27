import { z } from 'zod';

export const extraSchema = z.object({
  name: z.string().min(2, 'Extra name must be at least 2 characters').max(100, 'Extra name must be less than 100 characters'),
  price: z.number().min(0, 'Price cannot be negative'),
  allergens: z.string().nullable(),
  categoryId: z.number().min(1, 'Category is required'),
  soldOut: z.boolean(),
});

export type ExtraFormData = z.infer<typeof extraSchema>;