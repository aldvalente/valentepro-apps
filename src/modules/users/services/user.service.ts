// User Management Service
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import {
  User,
  UserWithRelations,
  CreateUserInput,
  UpdateUserInput,
  NotFoundError,
  ValidationError,
  ConflictError,
} from '@/src/common/types';
import { UserRole, LicenseType } from '@prisma/client';

export class UserService {
  /**
   * Create new user
   */
  async createUser(data: CreateUserInput): Promise<User> {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        phone: data.phone,
        role: data.role || 'USER',
      },
    });

    return user;
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string, includeRelations = false): Promise<UserWithRelations> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: includeRelations
        ? {
            ownedBoats: {
              where: { isActive: true },
              select: {
                id: true,
                name: true,
                boatType: true,
                dailyPrice: true,
                images: true,
              },
            },
            bookingsAsRenter: {
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
            skipperBookings: {
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
          }
        : undefined,
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Update user profile
   */
  async updateUser(id: string, data: UpdateUserInput): Promise<User> {
    const user = await this.getUserById(id);

    const updated = await prisma.user.update({
      where: { id },
      data,
    });

    return updated;
  }

  /**
   * Update user license information
   */
  async updateLicense(
    id: string,
    licenseData: {
      licenseType: LicenseType;
      licenseNumber: string;
      licenseExpiry: Date;
      licenseCountry: string;
    }
  ): Promise<User> {
    // Validate license expiry
    if (new Date(licenseData.licenseExpiry) < new Date()) {
      throw new ValidationError('License expiry date must be in the future');
    }

    return await prisma.user.update({
      where: { id },
      data: licenseData,
    });
  }

  /**
   * Change user password
   */
  async changePassword(
    id: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user || !user.passwordHash) {
      throw new NotFoundError('User not found');
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new ValidationError('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id },
      data: { passwordHash: newPasswordHash },
    });
  }

  /**
   * Verify user password
   */
  async verifyPassword(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);

    if (!user || !user.passwordHash) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    return isValid ? user : null;
  }

  /**
   * Update user role (admin only)
   */
  async updateUserRole(userId: string, newRole: UserRole): Promise<User> {
    return await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string): Promise<any> {
    const user = await this.getUserById(userId);

    const [
      totalBoats,
      activeBoats,
      totalBookingsAsRenter,
      completedBookingsAsRenter,
      totalBookingsAsOwner,
      totalBookingsAsSkipper,
      receivedReviews,
    ] = await Promise.all([
      prisma.boat.count({ where: { ownerId: userId } }),
      prisma.boat.count({ where: { ownerId: userId, isActive: true } }),
      prisma.booking.count({ where: { renterId: userId } }),
      prisma.booking.count({ where: { renterId: userId, status: 'COMPLETED' } }),
      prisma.booking.count({
        where: {
          boat: { ownerId: userId },
        },
      }),
      user.role === 'SKIPPER'
        ? prisma.booking.count({ where: { skipperId: userId } })
        : 0,
      prisma.review.count({
        where: { targetId: userId },
      }),
    ]);

    // Calculate average rating
    const reviews = await prisma.review.findMany({
      where: { targetId: userId },
      select: { rating: true },
    });

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    return {
      totalBoats,
      activeBoats,
      totalBookingsAsRenter,
      completedBookingsAsRenter,
      totalBookingsAsOwner,
      totalBookingsAsSkipper,
      receivedReviews: reviews.length,
      avgRating: Math.round(avgRating * 10) / 10,
    };
  }

  /**
   * Delete user account (soft delete - deactivate)
   */
  async deleteUser(userId: string): Promise<void> {
    // Check for active bookings
    const activeBookings = await prisma.booking.count({
      where: {
        OR: [
          { renterId: userId },
          { skipperId: userId },
          { boat: { ownerId: userId } },
        ],
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    });

    if (activeBookings > 0) {
      throw new ValidationError('Cannot delete account with active bookings');
    }

    // Instead of deleting, we could mark as inactive or anonymize
    // For this implementation, we'll allow deletion
    await prisma.user.delete({
      where: { id: userId },
    });
  }
}

export const userService = new UserService();
