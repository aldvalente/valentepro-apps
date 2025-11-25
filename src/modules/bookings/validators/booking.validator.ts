// Booking validation schemas
import { z } from 'zod';
import { BookingStatus } from '@prisma/client';

export const createBookingSchema = z.object({
  boatId: z.string().cuid(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  withSkipper: z.boolean(),
  skipperId: z.string().cuid().optional(),
  extras: z.array(z.object({
    extraId: z.string().cuid(),
    quantity: z.number().int().positive().default(1),
  })).optional(),
  renterNotes: z.string().max(2000).optional(),
}).refine(
  (data) => new Date(data.endDate) > new Date(data.startDate),
  { message: 'End date must be after start date', path: ['endDate'] }
).refine(
  (data) => !data.withSkipper || data.skipperId,
  { message: 'Skipper ID is required when booking with skipper', path: ['skipperId'] }
);

export const bookingQuoteSchema = z.object({
  boatId: z.string().cuid(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  withSkipper: z.boolean(),
  extras: z.array(z.object({
    extraId: z.string().cuid(),
    quantity: z.number().int().positive().default(1),
  })).optional(),
}).refine(
  (data) => new Date(data.endDate) > new Date(data.startDate),
  { message: 'End date must be after start date', path: ['endDate'] }
);

export const updateBookingStatusSchema = z.object({
  status: z.nativeEnum(BookingStatus),
  ownerNotes: z.string().max(2000).optional(),
});

export const bookingFiltersSchema = z.object({
  status: z.nativeEnum(BookingStatus).optional(),
  boatId: z.string().cuid().optional(),
  renterId: z.string().cuid().optional(),
  skipperId: z.string().cuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  asOwner: z.boolean().optional(),
  asSkipper: z.boolean().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export const checkAvailabilitySchema = z.object({
  boatId: z.string().cuid(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
}).refine(
  (data) => new Date(data.endDate) > new Date(data.startDate),
  { message: 'End date must be after start date', path: ['endDate'] }
);

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type BookingQuoteInput = z.infer<typeof bookingQuoteSchema>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;
export type BookingFiltersInput = z.infer<typeof bookingFiltersSchema>;
