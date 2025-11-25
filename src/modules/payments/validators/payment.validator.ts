// Payment validation schemas
import { z } from 'zod';
import { PaymentStatus } from '@prisma/client';

export const processPaymentSchema = z.object({
  bookingId: z.string().cuid(),
  paymentMethod: z.enum(['credit_card', 'paypal', 'bank_transfer']),
  amount: z.number().positive(),
});

export const updatePaymentStatusSchema = z.object({
  status: z.nativeEnum(PaymentStatus),
  transactionId: z.string().optional(),
});

export const paymentFiltersSchema = z.object({
  userId: z.string().cuid().optional(),
  bookingId: z.string().cuid().optional(),
  status: z.nativeEnum(PaymentStatus).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export type ProcessPaymentInput = z.infer<typeof processPaymentSchema>;
export type UpdatePaymentStatusInput = z.infer<typeof updatePaymentStatusSchema>;
export type PaymentFiltersInput = z.infer<typeof paymentFiltersSchema>;
