// User and Skipper validation schemas
import { z } from 'zod';
import { UserRole, LicenseType } from '@prisma/client';

export const createUserSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  phone: z.string().max(50).optional(),
  role: z.nativeEnum(UserRole).default('USER'),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  phone: z.string().max(50).optional(),
  image: z.string().url().optional(),
  licenseType: z.nativeEnum(LicenseType).optional(),
  licenseNumber: z.string().max(100).optional(),
  licenseExpiry: z.string().datetime().optional(),
  licenseCountry: z.string().max(100).optional(),
});

export const createSkipperProfileSchema = z.object({
  bio: z.string().min(10).max(2000),
  experience: z.number().int().min(0).max(100),
  certifications: z.array(z.string().max(200)),
  hourlyRate: z.number().positive(),
});

export const updateSkipperProfileSchema = createSkipperProfileSchema.partial();

export const skipperSearchSchema = z.object({
  minRating: z.number().min(0).max(5).optional(),
  minExperience: z.number().int().min(0).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  location: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export const updateLicenseSchema = z.object({
  licenseType: z.nativeEnum(LicenseType),
  licenseNumber: z.string().min(1).max(100),
  licenseExpiry: z.string().datetime(),
  licenseCountry: z.string().min(2).max(100),
}).refine(
  (data) => new Date(data.licenseExpiry) > new Date(),
  { message: 'License must not be expired', path: ['licenseExpiry'] }
);

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateSkipperProfileInput = z.infer<typeof createSkipperProfileSchema>;
export type SkipperSearchInput = z.infer<typeof skipperSearchSchema>;
