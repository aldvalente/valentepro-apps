// Review Management Service
import { prisma } from '@/lib/prisma';
import {
  Review,
  ReviewWithRelations,
  CreateReviewRequest,
  NotFoundError,
  ForbiddenError,
  ValidationError,
  PaginatedResponse,
} from '@/src/common/types';
import { skipperService } from '@/src/modules/skippers/services/skipper.service';

export class ReviewService {
  /**
   * Create a review with validation
   */
  async createReview(
    authorId: string,
    data: CreateReviewRequest
  ): Promise<any> {
    const { bookingId, targetId, targetType, rating, comment } = data;

    // Get booking details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        boat: true,
        renter: true,
        skipper: true,
      },
    });

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    // Verify booking is completed
    if (booking.status !== 'COMPLETED') {
      throw new ValidationError('Reviews can only be created for completed bookings');
    }

    // Verify user participated in the booking
    const userInvolved =
      booking.renterId === authorId ||
      booking.boat.ownerId === authorId ||
      booking.skipperId === authorId;

    if (!userInvolved) {
      throw new ForbiddenError('You can only review bookings you participated in');
    }

    // Anti-self-review protection
    if (authorId === targetId) {
      throw new ValidationError('You cannot review yourself');
    }

    // Validate target based on type
    await this.validateReviewTarget(booking, authorId, targetId, targetType);

    // Check for existing review
    const existingReview = await prisma.review.findFirst({
      where: {
        bookingId,
        authorId,
        targetId,
        targetType,
      },
    });

    if (existingReview) {
      throw new ValidationError('You have already reviewed this target for this booking');
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        bookingId,
        authorId,
        targetId,
        targetType,
        rating,
        comment,
        isVerified: true, // Auto-verify since booking is completed
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        booking: {
          select: {
            id: true,
            startDate: true,
            endDate: true,
          },
        },
      },
    });

    // Update skipper rating if reviewing a skipper
    if (targetType === 'skipper') {
      await skipperService.updateSkipperRating(targetId);
    }

    return review;
  }

  /**
   * Validate review target based on booking participants
   */
  private async validateReviewTarget(
    booking: any,
    authorId: string,
    targetId: string,
    targetType: string
  ): Promise<void> {
    if (targetType === 'boat') {
      // Only renter can review boat
      if (booking.renterId !== authorId) {
        throw new ForbiddenError('Only the renter can review the boat');
      }
      if (booking.boatId !== targetId) {
        throw new ValidationError('Target boat does not match the booking');
      }
    } else if (targetType === 'skipper') {
      // Renter or boat owner can review skipper
      if (booking.renterId !== authorId && booking.boat.ownerId !== authorId) {
        throw new ForbiddenError('Only the renter or boat owner can review the skipper');
      }
      if (booking.skipperId !== targetId) {
        throw new ValidationError('Target skipper does not match the booking');
      }
      if (!booking.skipperId) {
        throw new ValidationError('This booking did not have a skipper');
      }
    } else if (targetType === 'renter') {
      // Boat owner or skipper can review renter
      if (booking.boat.ownerId !== authorId && booking.skipperId !== authorId) {
        throw new ForbiddenError('Only the boat owner or skipper can review the renter');
      }
      if (booking.renterId !== targetId) {
        throw new ValidationError('Target renter does not match the booking');
      }
    } else {
      throw new ValidationError('Invalid target type');
    }
  }

  /**
   * Get review by ID
   */
  async getReviewById(id: string): Promise<any> {
    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
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
    });

    if (!review) {
      throw new NotFoundError('Review not found');
    }

    return review;
  }

  /**
   * Get reviews for a target (boat, skipper, or renter)
   */
  async getReviewsForTarget(
    targetId: string,
    targetType: string,
    filters: any = {}
  ): Promise<PaginatedResponse<ReviewWithRelations>> {
    const { minRating, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {
      targetId,
      targetType,
      isVerified: true,
    };

    if (minRating !== undefined) {
      where.rating = { gte: minRating };
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          booking: {
            select: {
              id: true,
              startDate: true,
              endDate: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.review.count({ where }),
    ]);

    return {
      data: reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update review (author only)
   */
  async updateReview(
    id: string,
    authorId: string,
    data: { rating?: number; comment?: string }
  ): Promise<any> {
    const review = await this.getReviewById(id);

    if (review.authorId !== authorId) {
      throw new ForbiddenError('You can only update your own reviews');
    }

    const updated = await prisma.review.update({
      where: { id },
      data,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        booking: true,
      },
    });

    // Update skipper rating if reviewing a skipper and rating changed
    if (review.targetType === 'skipper' && data.rating !== undefined) {
      await skipperService.updateSkipperRating(review.targetId);
    }

    return updated;
  }

  /**
   * Delete review (author only)
   */
  async deleteReview(id: string, authorId: string): Promise<void> {
    const review = await this.getReviewById(id);

    if (review.authorId !== authorId) {
      throw new ForbiddenError('You can only delete your own reviews');
    }

    await prisma.review.delete({ where: { id } });

    // Update skipper rating if was a skipper review
    if (review.targetType === 'skipper') {
      await skipperService.updateSkipperRating(review.targetId);
    }
  }

  /**
   * Get user's authored reviews
   */
  async getUserReviews(
    userId: string,
    filters: any = {}
  ): Promise<PaginatedResponse<ReviewWithRelations>> {
    const { page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { authorId: userId },
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
      prisma.review.count({ where: { authorId: userId } }),
    ]);

    return {
      data: reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Calculate average rating for a target
   */
  async getAverageRating(targetId: string, targetType: string): Promise<number> {
    const reviews = await prisma.review.findMany({
      where: {
        targetId,
        targetType,
        isVerified: true,
      },
      select: {
        rating: true,
      },
    });

    if (reviews.length === 0) {
      return 0;
    }

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    return Math.round(avgRating * 10) / 10;
  }
}

export const reviewService = new ReviewService();
