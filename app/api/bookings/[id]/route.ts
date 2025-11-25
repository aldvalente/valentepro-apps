// Bookings API - Get and Update specific booking
import { NextRequest } from 'next/server';
import { bookingService } from '@/src/modules/bookings/services/booking.service';
import { updateBookingStatusSchema } from '@/src/modules/bookings/validators/booking.validator';
import { requireAuth } from '@/src/common/middleware/auth';
import { handleError, successResponse } from '@/src/common/middleware/error-handler';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth();
    const booking = await bookingService.getBookingById(params.id, auth.userId);
    
    return successResponse(booking);
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth();
    const body = await req.json();
    
    const { status, ownerNotes } = updateBookingStatusSchema.parse(body);
    const booking = await bookingService.updateBookingStatus(
      params.id,
      auth.userId,
      auth.role,
      status,
      ownerNotes
    );
    
    return successResponse(booking);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth();
    const booking = await bookingService.cancelBooking(params.id, auth.userId);
    
    return successResponse(booking);
  } catch (error) {
    return handleError(error);
  }
}
