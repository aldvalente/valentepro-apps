// Booking Management Service with Reservation Workflow
import { prisma } from '@/lib/prisma';
import {
  Booking,
  BookingWithRelations,
  CreateBookingRequest,
  BookingQuoteRequest,
  BookingQuoteResponse,
  NotFoundError,
  ForbiddenError,
  ValidationError,
  ConflictError,
  PaginatedResponse,
} from '@/src/common/types';
import { BookingStatus, LicenseType } from '@prisma/client';
import { boatService } from '@/src/modules/boats/services/boat.service';

export class BookingService {
  /**
   * Calculate booking quote with breakdown
   */
  async calculateQuote(data: BookingQuoteRequest): Promise<BookingQuoteResponse> {
    const { boatId, startDate, endDate, withSkipper, extras } = data;

    // Get boat details
    const boat = await boatService.getBoatById(boatId);

    // Calculate days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    if (days <= 0) {
      throw new ValidationError('Invalid date range');
    }

    // Check availability
    const availability = await boatService.checkAvailability(boatId, start, end);
    if (!availability.available) {
      throw new ConflictError('Boat is not available for the selected dates');
    }

    // Calculate boat price
    let boatPrice = days * boat.dailyPrice;

    // Apply weekly discount if applicable
    if (days >= 7 && boat.weeklyPrice) {
      const weeks = Math.floor(days / 7);
      const remainingDays = days % 7;
      boatPrice = weeks * boat.weeklyPrice + remainingDays * boat.dailyPrice;
    }

    // Calculate skipper price
    let skipperPrice = 0;
    if (withSkipper) {
      if (!boat.skipperAvailable) {
        throw new ValidationError('Skipper service not available for this boat');
      }
      skipperPrice = days * (boat.skipperDailyRate || 0);
    }

    // Calculate extras price
    let extrasPrice = 0;
    const extrasBreakdown: any[] = [];

    if (extras && extras.length > 0) {
      const boatExtras = await boatService.getBoatExtras(boatId);
      
      for (const extraItem of extras) {
        const extra = boatExtras.find((e) => e.id === extraItem.extraId);
        if (!extra) {
          throw new NotFoundError(`Extra ${extraItem.extraId} not found`);
        }

        let extraTotal = extra.price * extraItem.quantity;
        if (extra.priceType === 'per_day') {
          extraTotal *= days;
        }

        extrasPrice += extraTotal;
        extrasBreakdown.push({
          name: extra.name,
          price: extra.price,
          quantity: extraItem.quantity,
          total: extraTotal,
        });
      }
    }

    const totalPrice = boatPrice + skipperPrice + extrasPrice;

    return {
      boatPrice,
      skipperPrice,
      extrasPrice,
      totalPrice,
      days,
      breakdown: {
        boat: {
          dailyRate: boat.dailyPrice,
          days,
          total: boatPrice,
        },
        ...(withSkipper && {
          skipper: {
            dailyRate: boat.skipperDailyRate || 0,
            days,
            total: skipperPrice,
          },
        }),
        ...(extrasBreakdown.length > 0 && {
          extras: extrasBreakdown,
        }),
      },
    };
  }

  /**
   * Create a new booking with full validation
   */
  async createBooking(
    renterId: string,
    data: CreateBookingRequest
  ): Promise<BookingWithRelations> {
    const { boatId, startDate, endDate, withSkipper, skipperId, extras, renterNotes } = data;

    // Get boat and renter details
    const [boat, renter] = await Promise.all([
      boatService.getBoatById(boatId),
      prisma.user.findUnique({ where: { id: renterId } }),
    ]);

    if (!renter) {
      throw new NotFoundError('Renter not found');
    }

    // Validate boat owner cannot rent own boat
    if (boat.ownerId === renterId) {
      throw new ValidationError('You cannot rent your own boat');
    }

    // Validate license requirements for bareboat rentals
    if (!withSkipper && !boat.skipperRequired) {
      await this.validateRenterLicense(renter, boat.requiredLicense);
    }

    // Validate skipper requirement
    if (boat.skipperRequired && !withSkipper) {
      throw new ValidationError('This boat requires a skipper');
    }

    // Validate skipper if provided
    if (withSkipper && skipperId) {
      await this.validateSkipper(skipperId, new Date(startDate), new Date(endDate));
    }

    // Calculate quote
    const quote = await this.calculateQuote({
      boatId,
      startDate,
      endDate,
      withSkipper,
      extras,
    });

    // Create booking with extras
    const booking = await prisma.booking.create({
      data: {
        boatId,
        renterId,
        skipperId: withSkipper ? skipperId : undefined,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        withSkipper,
        boatPrice: quote.boatPrice,
        skipperPrice: quote.skipperPrice,
        extrasPrice: quote.extrasPrice,
        totalPrice: quote.totalPrice,
        status: 'PENDING',
        renterNotes,
        renterLicense: renter.licenseNumber,
        extras: extras
          ? {
              create: extras.map((e) => ({
                extraId: e.extraId,
                quantity: e.quantity,
                priceAtBooking: 0, // Will be updated with actual price
              })),
            }
          : undefined,
      },
      include: {
        boat: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        renter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        skipper: {
          select: {
            id: true,
            name: true,
            email: true,
            skipperRating: true,
          },
        },
        extras: {
          include: {
            extra: true,
          },
        },
      },
    });

    // Update extras with actual prices
    if (extras && extras.length > 0) {
      const boatExtras = await boatService.getBoatExtras(boatId);
      for (const bookingExtra of booking.extras || []) {
        const extra = boatExtras.find((e) => e.id === bookingExtra.extraId);
        if (extra) {
          await prisma.bookingExtra.update({
            where: { id: bookingExtra.id },
            data: { priceAtBooking: extra.price },
          });
        }
      }
    }

    return booking;
  }

  /**
   * Validate renter's license for bareboat rental
   */
  private async validateRenterLicense(
    renter: any,
    requiredLicense: LicenseType
  ): Promise<void> {
    if (requiredLicense === 'NONE') {
      return; // No license required
    }

    if (!renter.licenseType || renter.licenseType === 'NONE') {
      throw new ValidationError('A valid boating license is required for this rental');
    }

    // Check license expiry
    if (renter.licenseExpiry && new Date(renter.licenseExpiry) < new Date()) {
      throw new ValidationError('Your boating license has expired');
    }

    // Validate license level (simplified hierarchy)
    const licenseHierarchy = {
      NONE: 0,
      BASIC: 1,
      COASTAL: 2,
      OFFSHORE: 3,
      PROFESSIONAL: 4,
    };

    if (licenseHierarchy[renter.licenseType] < licenseHierarchy[requiredLicense]) {
      throw new ValidationError(
        `This boat requires a ${requiredLicense} license or higher. You have ${renter.licenseType}.`
      );
    }
  }

  /**
   * Validate skipper availability and credentials
   */
  private async validateSkipper(
    skipperId: string,
    startDate: Date,
    endDate: Date
  ): Promise<void> {
    const skipper = await prisma.user.findUnique({
      where: { id: skipperId },
    });

    if (!skipper || skipper.role !== 'SKIPPER') {
      throw new NotFoundError('Skipper not found');
    }

    if (!skipper.hourlyRate || skipper.hourlyRate <= 0) {
      throw new ValidationError('Skipper has not set up their profile');
    }

    // Check skipper availability
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
    });

    if (conflictingBookings.length > 0) {
      throw new ConflictError('Skipper is not available for the selected dates');
    }
  }

  /**
   * Get booking by ID
   */
  async getBookingById(id: string, userId?: string): Promise<BookingWithRelations> {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        boat: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        renter: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        skipper: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            skipperRating: true,
            skipperExperience: true,
          },
        },
        extras: {
          include: {
            extra: true,
          },
        },
        payment: true,
        reviews: true,
      },
    });

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    // Check access permissions
    if (userId) {
      const hasAccess =
        booking.renterId === userId ||
        booking.boat.ownerId === userId ||
        booking.skipperId === userId;

      if (!hasAccess) {
        throw new ForbiddenError('You do not have access to this booking');
      }
    }

    return booking;
  }

  /**
   * Get user's bookings
   */
  async getUserBookings(
    userId: string,
    filters: any = {}
  ): Promise<PaginatedResponse<BookingWithRelations>> {
    const { status, asOwner, asSkipper, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    let where: any = {};

    if (asOwner) {
      where = {
        boat: { ownerId: userId },
      };
    } else if (asSkipper) {
      where = {
        skipperId: userId,
      };
    } else {
      where = {
        renterId: userId,
      };
    }

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
            },
          },
          renter: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          skipper: {
            select: {
              id: true,
              name: true,
            },
          },
          payment: {
            select: {
              status: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
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
   * Update booking status (owner/admin only)
   */
  async updateBookingStatus(
    bookingId: string,
    userId: string,
    userRole: string,
    status: BookingStatus,
    ownerNotes?: string
  ): Promise<BookingWithRelations> {
    const booking = await this.getBookingById(bookingId);

    // Check permissions
    const isOwner = booking.boat.ownerId === userId;
    const isAdmin = userRole === 'ADMIN';

    if (!isOwner && !isAdmin) {
      throw new ForbiddenError('Only the boat owner or admin can update booking status');
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status,
        ...(ownerNotes && { ownerNotes }),
      },
      include: {
        boat: true,
        renter: true,
        skipper: true,
        extras: {
          include: { extra: true },
        },
        payment: true,
      },
    });

    return updated;
  }

  /**
   * Cancel booking (renter only)
   */
  async cancelBooking(bookingId: string, userId: string): Promise<BookingWithRelations> {
    const booking = await this.getBookingById(bookingId, userId);

    if (booking.renterId !== userId) {
      throw new ForbiddenError('Only the renter can cancel the booking');
    }

    if (booking.status === 'COMPLETED' || booking.status === 'CANCELLED') {
      throw new ValidationError('Cannot cancel a completed or already cancelled booking');
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' },
      include: {
        boat: true,
        renter: true,
        skipper: true,
      },
    });

    return updated;
  }
}

export const bookingService = new BookingService();
