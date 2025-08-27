export interface Address {
  line1: string;
  line2?: string;
  line3?: string;
  postcode: string;
  safePlace?: string;
}

export interface Location {
  latitude?: number;
  longitude?: number;
}

export enum AccountStatus {
  Registered = 'Registered',
  EmailVerified = 'EmailVerified',
  InfoCompleted = 'InfoCompleted',
  Active = 'Active',
  Inactive = 'Inactive',
  Rejected = 'Rejected',
}

export enum Role {
  Admin = 'Admin',
  User = 'User',
}

export interface Account {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  telephone?: string;
  address?: Address;
  location?: Location;
  routeId?: number;
  allergens?: string;
  status: AccountStatus;
  role: Role;
  created: string;
  updated?: string;
}