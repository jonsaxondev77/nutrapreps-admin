import { z } from 'zod';

export const packageSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long.'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be a positive number.'),
  mealsPerWeek: z.coerce.number().int().min(1, 'Must include at least 1 meal per week.'),
  stripeProductId: z.string().optional().nullable(),
});

export type PackageFormData = z.infer<typeof packageSchema>;
