// Skipper Management Service
import { prisma } from '@/lib/prisma';
import {
  User,
  UserWithRelations,
  CreateSkipperProfileRequest,
  SkipperSearchFilters,
  NotFoundError,
  ForbiddenError,
  ValidationError,
  PaginatedResponse,
} from '@/src/common/types';

export class SkipperService {
  /**
   * Create or update skipper profile
   */
  async createSkipperProfile(
    userId: string,
    data: CreateSkipperProfileRequest
  ): Promise<User> {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Update user role to SKIPPER and set skipper fields
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: 'SKIPPER',
        skipperBio: data.bio,
        skipperExperience: data.experience,
        skipperCertifications: data.certifications,
        hourlyRate: data.hourlyRate,
        skipperRating: 0, // Initial rating
      },
    });

    return updatedUser;
  }

  /**
   * Update skipper profile
   */
  async updateSkipperProfile(userId: string, data: Partial<CreateSkipperProfileRequest>) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.role !== 'SKIPPER') {
      throw new ValidationError('User is not a skipper');
    }

    return await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.bio && { skipperBio: data.bio }),
        ...(data.experience !== undefined && { skipperExperience: data.experience }),
        ...(data.certifications && { skipperCertifications: data.certifications }),
        ...(data.hourlyRate !== undefined && { hourlyRate: data.hourlyRate }),
      },
    });
  }

  /**
   * Get skipper by ID
   */
  async getSkipperById(id: string): Promise<UserWithRelations> {
    const skipper = await prisma.user.findUnique({
      where: { id },
      include: {
        skipperBookings: {
          where: {
            status: { in: ['COMPLETED'] },
          },
          include: {
            boat: {
              select: {
                id: true,
                name: true,
                boatType: true,
              },
            },
            reviews: {
              where: {
                targetType: 'skipper',
                targetId: id,
              },
              include: {
                author: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        receivedReviews: {
          where: {
            targetType: 'skipper',
          },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!skipper || skipper.role !== 'SKIPPER') {
      throw new NotFoundError('Skipper not found');
    }

    return skipper;
  }

  /**
   * Search for available skippers
   */
  async searchSkippers(
    filters: SkipperSearchFilters & { page?: number; limit?: number }
  ): Promise<PaginatedResponse<User>> {
    const { minRating, minExperience, startDate, endDate, page = 1, limit = 20 } = filters;

    const where: any = {
      role: 'SKIPPER',
      hourlyRate: { gt: 0 }, // Only active skippers
    };

    if (minRating !== undefined) {
      where.skipperRating = { gte: minRating };
    }

    if (minExperience !== undefined) {
      where.skipperExperience = { gte: minExperience };
    }

    // If date range is provided, check availability
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Find skippers with conflicting bookings
      const conflictingSkipperIds = await prisma.booking.findMany({
        where: {
          skipperId: { not: null },
          status: { in: ['CONFIRMED', 'PENDING'] },
          OR: [
            {
              startDate: { lte: end },
              endDate: { gte: start },
            },
          ],
        },
        select: { skipperId: true },
      });

      const conflictingIds = conflictingSkipperIds
        .map((b) => b.skipperId)
        .filter((id): id is string => id !== null);

      if (conflictingIds.length > 0) {
        where.id = { notIn: conflictingIds };
      }
    }

    const skip = (page - 1) * limit;

    const [skippers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          skipperBio: true,
          skipperExperience: true,
          skipperRating: true,
          skipperCertifications: true,
          hourlyRate: true,
          createdAt: true,
        },
        orderBy: [{ skipperRating: 'desc' }, { skipperExperience: 'desc' }],
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: skippers as User[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Check skipper availability for date range
   */
  async checkAvailability(
    skipperId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{ available: boolean; conflictingBookings: any[] }> {
    const skipper = await prisma.user.findUnique({
      where: { id: skipperId },
    });

    if (!skipper || skipper.role !== 'SKIPPER') {
      throw new NotFoundError('Skipper not found');
    }

    const conflictingBookings = await prisma.booking.findMany({
      where: {
        skipperId,
        status: { in: ['CONFIRMED', 'PENDING'] },
        OR: [
          {
            startDate: { lte: endDate },
            endDate: { gte: startDate },
          },
        ],
      },
      include: {
        boat: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      available: conflictingBookings.length === 0,
      conflictingBookings,
    };
  }

  /**
   * Get skipper bookings
   */
  async getSkipperBookings(skipperId: string, filters: any = {}) {
    const { status, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {
      skipperId,
    };

    if (status) {
      where.status = status;
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          boat: {
            select: {
              id: true,
              name: true,
              boatType: true,
              images: true,
              homePort: true,
            },
          },
          renter: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { startDate: 'desc' },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    return {
      data: bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update skipper rating (called after review)
   */
  async updateSkipperRating(skipperId: string): Promise<void> {
    // Calculate average rating from all skipper reviews
    const reviews = await prisma.review.findMany({
      where: {
        targetType: 'skipper',
        targetId: skipperId,
        isVerified: true,
      },
      select: {
        rating: true,
      },
    });

    if (reviews.length === 0) {
      return;
    }

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await prisma.user.update({
      where: { id: skipperId },
      data: {
        skipperRating: Math.round(avgRating * 10) / 10,
      },
    });
  }
}

export const skipperService = new SkipperService();
