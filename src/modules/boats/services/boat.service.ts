// Boat Management Service
import { prisma } from '@/lib/prisma';
import {
  Boat,
  BoatWithRelations,
  BoatSearchFilters,
  CreateBoatRequest,
  UpdateBoatRequest,
  NotFoundError,
  ForbiddenError,
  PaginatedResponse,
} from '@/src/common/types';
import { BoatType, AvailabilityStatus } from '@prisma/client';

export class BoatService {
  /**
   * Create a new boat listing
   */
  async createBoat(ownerId: string, data: CreateBoatRequest): Promise<BoatWithRelations> {
    const boat = await prisma.boat.create({
      data: {
        ...data,
        ownerId,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return boat;
  }

  /**
   * Get boat by ID with relations
   */
  async getBoatById(id: string, includeInactive = false): Promise<BoatWithRelations> {
    const boat = await prisma.boat.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
          },
        },
        extras: {
          where: { isActive: true },
        },
        availabilities: {
          where: {
            endDate: { gte: new Date() },
          },
          orderBy: { startDate: 'asc' },
          take: 10,
        },
        reviews: {
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

    if (!boat || (!includeInactive && !boat.isActive)) {
      throw new NotFoundError('Boat not found');
    }

    // Calculate average rating
    const avgRating =
      boat.reviews.length > 0
        ? boat.reviews.reduce((sum, r) => sum + r.rating, 0) / boat.reviews.length
        : 0;

    return {
      ...boat,
      avgRating: Math.round(avgRating * 10) / 10,
      reviewCount: boat.reviews.length,
    };
  }

  /**
   * Search and filter boats
   */
  async searchBoats(
    filters: BoatSearchFilters & { page?: number; limit?: number }
  ): Promise<PaginatedResponse<BoatWithRelations>> {
    const {
      boatType,
      minPrice,
      maxPrice,
      minCapacity,
      location,
      startDate,
      endDate,
      withSkipper,
      requiredLicense,
      page = 1,
      limit = 20,
    } = filters;

    const where: any = { isActive: true };

    if (boatType) {
      where.boatType = boatType;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.dailyPrice = {};
      if (minPrice !== undefined) where.dailyPrice.gte = minPrice;
      if (maxPrice !== undefined) where.dailyPrice.lte = maxPrice;
    }

    if (minCapacity !== undefined) {
      where.capacity = { gte: minCapacity };
    }

    if (location) {
      where.OR = [
        { homePort: { contains: location, mode: 'insensitive' } },
        { locationAddress: { contains: location, mode: 'insensitive' } },
      ];
    }

    if (withSkipper !== undefined) {
      if (withSkipper) {
        where.skipperAvailable = true;
      } else {
        where.skipperRequired = false;
      }
    }

    if (requiredLicense) {
      where.requiredLicense = requiredLicense;
    }

    // If date range is provided, check availability
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Find boats with conflicting bookings
      const conflictingBoatIds = await prisma.booking.findMany({
        where: {
          status: { in: ['CONFIRMED', 'PENDING'] },
          OR: [
            {
              startDate: { lte: end },
              endDate: { gte: start },
            },
          ],
        },
        select: { boatId: true },
      });

      const conflictingIds = conflictingBoatIds.map((b) => b.boatId);
      if (conflictingIds.length > 0) {
        where.id = { notIn: conflictingIds };
      }
    }

    const skip = (page - 1) * limit;

    const [boats, total] = await Promise.all([
      prisma.boat.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          reviews: {
            select: { rating: true },
          },
          extras: {
            where: { isActive: true },
            select: { id: true, name: true, price: true, priceType: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.boat.count({ where }),
    ]);

    // Add rating stats
    const boatsWithStats = boats.map((boat) => {
      const avgRating =
        boat.reviews.length > 0
          ? boat.reviews.reduce((sum, r) => sum + r.rating, 0) / boat.reviews.length
          : 0;
      return {
        ...boat,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: boat.reviews.length,
      };
    });

    return {
      data: boatsWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update boat information
   */
  async updateBoat(
    id: string,
    ownerId: string,
    data: UpdateBoatRequest
  ): Promise<BoatWithRelations> {
    const boat = await this.getBoatById(id, true);

    if (boat.ownerId !== ownerId) {
      throw new ForbiddenError('You can only update your own boats');
    }

    const updated = await prisma.boat.update({
      where: { id },
      data,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        extras: true,
      },
    });

    return updated;
  }

  /**
   * Delete/deactivate boat
   */
  async deleteBoat(id: string, ownerId: string): Promise<void> {
    const boat = await this.getBoatById(id, true);

    if (boat.ownerId !== ownerId) {
      throw new ForbiddenError('You can only delete your own boats');
    }

    // Check for active bookings
    const activeBookings = await prisma.booking.count({
      where: {
        boatId: id,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    });

    if (activeBookings > 0) {
      throw new ForbiddenError('Cannot delete boat with active bookings. Deactivate it instead.');
    }

    // Soft delete by marking as inactive
    await prisma.boat.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Get owner's boats
   */
  async getOwnerBoats(ownerId: string): Promise<BoatWithRelations[]> {
    const boats = await prisma.boat.findMany({
      where: { ownerId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        bookings: {
          where: {
            status: { in: ['PENDING', 'CONFIRMED'] },
          },
          select: {
            id: true,
            startDate: true,
            endDate: true,
            status: true,
          },
        },
        reviews: {
          select: { rating: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return boats.map((boat) => {
      const avgRating =
        boat.reviews.length > 0
          ? boat.reviews.reduce((sum, r) => sum + r.rating, 0) / boat.reviews.length
          : 0;
      return {
        ...boat,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: boat.reviews.length,
      };
    });
  }

  /**
   * Check boat availability for a date range
   */
  async checkAvailability(
    boatId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{ available: boolean; conflictingBookings: any[] }> {
    const conflictingBookings = await prisma.booking.findMany({
      where: {
        boatId,
        status: { in: ['CONFIRMED', 'PENDING'] },
        OR: [
          {
            startDate: { lte: endDate },
            endDate: { gte: startDate },
          },
        ],
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        status: true,
      },
    });

    return {
      available: conflictingBookings.length === 0,
      conflictingBookings,
    };
  }

  /**
   * Add extra to boat
   */
  async addExtra(boatId: string, ownerId: string, extraData: any) {
    const boat = await this.getBoatById(boatId, true);

    if (boat.ownerId !== ownerId) {
      throw new ForbiddenError('You can only add extras to your own boats');
    }

    return await prisma.boatExtra.create({
      data: {
        ...extraData,
        boatId,
      },
    });
  }

  /**
   * Update boat extra
   */
  async updateExtra(extraId: string, ownerId: string, updateData: any) {
    const extra = await prisma.boatExtra.findUnique({
      where: { id: extraId },
      include: { boat: true },
    });

    if (!extra) {
      throw new NotFoundError('Extra not found');
    }

    if (extra.boat.ownerId !== ownerId) {
      throw new ForbiddenError('You can only update extras for your own boats');
    }

    return await prisma.boatExtra.update({
      where: { id: extraId },
      data: updateData,
    });
  }

  /**
   * Get boat extras
   */
  async getBoatExtras(boatId: string) {
    return await prisma.boatExtra.findMany({
      where: {
        boatId,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });
  }
}

export const boatService = new BoatService();
