// Common TypeScript types for the Boat Rental Application

// Re-export Prisma types
export type {
  User,
  Boat,
  Booking,
  Review,
  Payment,
  BoatAvailability,
  BoatExtra,
  BookingExtra,
} from '@prisma/client';

export {
  UserRole,
  BookingStatus,
  PaymentStatus,
  LicenseType,
  BoatType,
  AvailabilityStatus,
} from '@prisma/client';

// Extended types with relations
export interface UserWithRelations extends User {
  ownedBoats?: Boat[];
  bookingsAsRenter?: Booking[];
  skipperBookings?: Booking[];
  reviews?: Review[];
  receivedReviews?: Review[];
}

export interface BoatWithRelations extends Boat {
  owner?: User;
  bookings?: Booking[];
  reviews?: Review[];
  availabilities?: BoatAvailability[];
  extras?: BoatExtra[];
  avgRating?: number;
  reviewCount?: number;
}

export interface BookingWithRelations extends Booking {
  boat?: Boat;
  renter?: User;
  skipper?: User | null;
  extras?: BookingExtra[];
  payment?: Payment | null;
  reviews?: Review[];
}

export interface ReviewWithRelations extends Review {
  author?: User;
  target?: User | null;
  boat?: Boat | null;
  booking?: Booking;
}

// API Request/Response types
export interface CreateBoatRequest {
  name: string;
  description: string;
  boatType: BoatType;
  length: number;
  capacity: number;
  cabins: number;
  bathrooms: number;
  enginePower?: number;
  yearBuilt: number;
  brand: string;
  model: string;
  homePort: string;
  locationAddress: string;
  latitude: number;
  longitude: number;
  dailyPrice: number;
  weeklyPrice?: number;
  requiredLicense: LicenseType;
  skipperRequired: boolean;
  skipperAvailable: boolean;
  skipperDailyRate?: number;
  features: string[];
  images: string[];
}

export interface UpdateBoatRequest extends Partial<CreateBoatRequest> {
  isActive?: boolean;
}

export interface BoatSearchFilters {
  boatType?: BoatType;
  minPrice?: number;
  maxPrice?: number;
  minCapacity?: number;
  location?: string;
  startDate?: string;
  endDate?: string;
  withSkipper?: boolean;
  requiredLicense?: LicenseType;
}

export interface CreateBookingRequest {
  boatId: string;
  startDate: string;
  endDate: string;
  withSkipper: boolean;
  skipperId?: string;
  extras?: Array<{ extraId: string; quantity: number }>;
  renterNotes?: string;
}

export interface BookingQuoteRequest {
  boatId: string;
  startDate: string;
  endDate: string;
  withSkipper: boolean;
  extras?: Array<{ extraId: string; quantity: number }>;
}

export interface BookingQuoteResponse {
  boatPrice: number;
  skipperPrice: number;
  extrasPrice: number;
  totalPrice: number;
  days: number;
  breakdown: {
    boat: { dailyRate: number; days: number; total: number };
    skipper?: { dailyRate: number; days: number; total: number };
    extras?: Array<{ name: string; price: number; quantity: number; total: number }>;
  };
}

export interface CreateReviewRequest {
  bookingId: string;
  targetId: string;
  targetType: 'boat' | 'skipper' | 'renter';
  rating: number;
  comment?: string;
}

export interface ProcessPaymentRequest {
  bookingId: string;
  paymentMethod: string;
  amount: number;
}

export interface SkipperSearchFilters {
  minRating?: number;
  minExperience?: number;
  startDate?: string;
  endDate?: string;
  location?: string;
}

export interface CreateSkipperProfileRequest {
  bio: string;
  experience: number;
  certifications: string[];
  hourlyRate: number;
}

// Calendar availability types
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface AvailabilityCheckResult {
  available: boolean;
  conflictingBookings?: Booking[];
  availabilityPeriods?: DateRange[];
}

// Error types
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public details?: any) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

// Auth types
export interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
  image?: string | null;
}

export interface AuthContext {
  user: SessionUser | null;
  isAuthenticated: boolean;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}
