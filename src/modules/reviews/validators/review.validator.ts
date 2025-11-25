// Review validation schemas
import { z } from 'zod';

export const createReviewSchema = z.object({
  bookingId: z.string().cuid(),
  targetId: z.string().cuid(),
  targetType: z.enum(['boat', 'skipper', 'renter']),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

export const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().max(2000).optional(),
});

export const reviewFiltersSchema = z.object({
  targetId: z.string().cuid().optional(),
  targetType: z.enum(['boat', 'skipper', 'renter']).optional(),
  minRating: z.number().int().min(1).max(5).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type ReviewFiltersInput = z.infer<typeof reviewFiltersSchema>;
