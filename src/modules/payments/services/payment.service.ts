// Payment Service (Mock Implementation)
import { prisma } from '@/lib/prisma';
import {
  Payment,
  ProcessPaymentRequest,
  NotFoundError,
  ForbiddenError,
  ValidationError,
  PaginatedResponse,
} from '@/src/common/types';
import { PaymentStatus } from '@prisma/client';

export class PaymentService {
  /**
   * Process payment (mock implementation)
   */
  async processPayment(userId: string, data: ProcessPaymentRequest): Promise<Payment> {
    const { bookingId, paymentMethod, amount } = data;

    // Get booking details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        boat: true,
        payment: true,
      },
    });

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    // Check if user is the renter
    if (booking.renterId !== userId) {
      throw new ForbiddenError('You can only pay for your own bookings');
    }

    // Check if payment already exists
    if (booking.payment) {
      throw new ValidationError('Payment already exists for this booking');
    }

    // Verify amount matches booking total
    if (amount !== booking.totalPrice) {
      throw new ValidationError(
        `Payment amount (${amount}) does not match booking total (${booking.totalPrice})`
      );
    }

    // Check booking status
    if (booking.status !== 'PENDING' && booking.status !== 'QUOTE') {
      throw new ValidationError('Booking must be in PENDING or QUOTE status to process payment');
    }

    // Mock payment processing
    const mockTransactionId = `mock_txn_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    const paymentSuccess = Math.random() > 0.1; // 90% success rate for mock

    const payment = await prisma.payment.create({
      data: {
        bookingId,
        userId,
        amount,
        currency: 'EUR',
        paymentMethod,
        status: paymentSuccess ? 'COMPLETED' : 'FAILED',
        transactionId: mockTransactionId,
        paidAt: paymentSuccess ? new Date() : undefined,
      },
    });

    // Update booking status if payment successful
    if (paymentSuccess) {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'CONFIRMED' },
      });
    }

    return payment;
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(id: string, userId?: string): Promise<Payment> {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            boat: {
              select: {
                ownerId: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    // Check access permissions
    if (userId) {
      const hasAccess =
        payment.userId === userId || payment.booking.boat.ownerId === userId;

      if (!hasAccess) {
        throw new ForbiddenError('You do not have access to this payment');
      }
    }

    return payment;
  }

  /**
   * Get payment by booking ID
   */
  async getPaymentByBookingId(bookingId: string, userId?: string): Promise<Payment | null> {
    const payment = await prisma.payment.findUnique({
      where: { bookingId },
      include: {
        booking: {
          include: {
            boat: {
              select: {
                ownerId: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      return null;
    }

    // Check access permissions
    if (userId) {
      const hasAccess =
        payment.userId === userId || payment.booking.boat.ownerId === userId;

      if (!hasAccess) {
        throw new ForbiddenError('You do not have access to this payment');
      }
    }

    return payment;
  }

  /**
   * Get user payments
   */
  async getUserPayments(
    userId: string,
    filters: any = {}
  ): Promise<PaginatedResponse<Payment>> {
    const { status, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (status) {
      where.status = status;
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          booking: {
            include: {
              boat: {
                select: {
                  id: true,
                  name: true,
                  boatType: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.payment.count({ where }),
    ]);

    return {
      data: payments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Retry failed payment
   */
  async retryPayment(paymentId: string, userId: string): Promise<Payment> {
    const payment = await this.getPaymentById(paymentId, userId);

    if (payment.status !== 'FAILED') {
      throw new ValidationError('Only failed payments can be retried');
    }

    // Mock retry
    const mockTransactionId = `mock_txn_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    const paymentSuccess = Math.random() > 0.1; // 90% success rate

    const updated = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: paymentSuccess ? 'COMPLETED' : 'FAILED',
        transactionId: mockTransactionId,
        paidAt: paymentSuccess ? new Date() : undefined,
      },
    });

    // Update booking status if payment successful
    if (paymentSuccess) {
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: 'CONFIRMED' },
      });
    }

    return updated;
  }

  /**
   * Process refund (mock implementation)
   */
  async processRefund(paymentId: string, userId: string, isAdmin: boolean): Promise<Payment> {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        booking: {
          include: {
            boat: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    // Check permissions (boat owner or admin)
    if (!isAdmin && payment.booking.boat.ownerId !== userId) {
      throw new ForbiddenError('Only the boat owner or admin can process refunds');
    }

    if (payment.status !== 'COMPLETED') {
      throw new ValidationError('Only completed payments can be refunded');
    }

    if (payment.booking.status !== 'CANCELLED') {
      throw new ValidationError('Booking must be cancelled before refunding');
    }

    // Mock refund processing
    const updated = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'REFUNDED',
      },
    });

    return updated;
  }

  /**
   * Update payment status (admin only)
   */
  async updatePaymentStatus(
    paymentId: string,
    status: PaymentStatus,
    transactionId?: string
  ): Promise<Payment> {
    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status,
        ...(transactionId && { transactionId }),
        ...(status === 'COMPLETED' && { paidAt: new Date() }),
      },
    });

    // Update booking status if payment completed
    if (status === 'COMPLETED') {
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: 'CONFIRMED' },
      });
    }

    return payment;
  }
}

export const paymentService = new PaymentService();
