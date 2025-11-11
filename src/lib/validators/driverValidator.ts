import * as z from 'zod';

export const driverValidator = z.object({
  firstName: z.string().min(1, 'First Name is required.'),
  surname: z.string().min(1, 'Surname is required.'),
  emailAddress: z.string().min(1, 'Email is required.').email('Invalid email address format.'),
  telephoneNumber: z.string().optional().nullable().transform(e => (e === "" ? null : e)),
});

export type DriverFormInput = z.infer<typeof driverValidator>;