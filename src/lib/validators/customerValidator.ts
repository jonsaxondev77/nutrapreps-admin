import { z } from 'zod';
import { AccountStatus } from '@/types/customers';

const addressSchema = z.object({
  line1: z.string().min(1, "Address line 1 is required"),
  line2: z.string().optional(),
  line3: z.string().optional(),
  postcode: z.string().min(1, "Postcode is required"),
  safePlace: z.string().optional(),
});

const locationSchema = z.object({
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const customerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  telephone: z.string().optional(),
  allergens: z.string().optional(),
  status: z.nativeEnum(AccountStatus),
  address: addressSchema,
  location: locationSchema,
  routeId: z.number()
});

export type CustomerFormData = z.infer<typeof customerSchema>;