// Booking Quote API - Calculate price quote
import { NextRequest } from 'next/server';
import { bookingService } from '@/src/modules/bookings/services/booking.service';
import { bookingQuoteSchema } from '@/src/modules/bookings/validators/booking.validator';
import { handleError, successResponse } from '@/src/common/middleware/error-handler';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = bookingQuoteSchema.parse(body);
    
    const quote = await bookingService.calculateQuote(data);
    
    return successResponse(quote);
  } catch (error) {
    return handleError(error);
  }
}
