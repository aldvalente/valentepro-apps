// Boat validation schemas
import { z } from 'zod';
import { BoatType, LicenseType } from '@prisma/client';

export const createBoatSchema = z.object({
  name: z.string().min(1, 'Boat name is required').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
  boatType: z.nativeEnum(BoatType),
  length: z.number().positive('Length must be positive').max(100),
  capacity: z.number().int().positive('Capacity must be positive').max(50),
  cabins: z.number().int().min(0).max(20),
  bathrooms: z.number().int().min(0).max(20),
  enginePower: z.number().int().positive().optional(),
  yearBuilt: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  brand: z.string().min(1).max(100),
  model: z.string().min(1).max(100),
  homePort: z.string().min(1).max(200),
  locationAddress: z.string().min(1).max(500),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  dailyPrice: z.number().positive('Daily price must be positive'),
  weeklyPrice: z.number().positive().optional(),
  requiredLicense: z.nativeEnum(LicenseType),
  skipperRequired: z.boolean(),
  skipperAvailable: z.boolean(),
  skipperDailyRate: z.number().positive().optional(),
  features: z.array(z.string()).default([]),
  images: z.array(z.string().url()).default([]),
});

export const updateBoatSchema = createBoatSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const boatSearchSchema = z.object({
  boatType: z.nativeEnum(BoatType).optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  minCapacity: z.number().int().positive().optional(),
  location: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  withSkipper: z.boolean().optional(),
  requiredLicense: z.nativeEnum(LicenseType).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export const boatIdSchema = z.object({
  id: z.string().cuid(),
});

export const createBoatExtraSchema = z.object({
  boatId: z.string().cuid(),
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  price: z.number().positive(),
  priceType: z.enum(['per_day', 'per_booking', 'per_hour']),
  isActive: z.boolean().default(true),
});

export const updateBoatExtraSchema = createBoatExtraSchema.partial().omit({ boatId: true });

export const createBoatAvailabilitySchema = z.object({
  boatId: z.string().cuid(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  status: z.enum(['AVAILABLE', 'BOOKED', 'MAINTENANCE', 'UNAVAILABLE']),
  notes: z.string().max(1000).optional(),
}).refine(
  (data) => new Date(data.endDate) > new Date(data.startDate),
  { message: 'End date must be after start date', path: ['endDate'] }
);

export type CreateBoatInput = z.infer<typeof createBoatSchema>;
export type UpdateBoatInput = z.infer<typeof updateBoatSchema>;
export type BoatSearchInput = z.infer<typeof boatSearchSchema>;
