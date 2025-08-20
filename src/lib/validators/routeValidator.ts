import { z } from 'zod';

export const routeSchema = z.object({
  name: z.string()
    .min(2, 'Route name must be at least 2 characters')
    .max(50, 'Route name must be less than 50 characters')
    .nonempty('Route name is required'),
  
  color: z.string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid hex color (e.g., #FF0000)'),
  
  textColor: z.string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid hex color (e.g., #FFFFFF)'),
  
  deliveryFee: z.number()
    .min(0, 'Delivery fee cannot be negative')
    .max(10000, 'Delivery fee is too high'),
  
  depotId: z.string()
    .min(2, 'Depot ID must be at least 2 characters')
    .nonempty('Depot ID is required'),
});

export type RouteFormData = z.infer<typeof routeSchema>;