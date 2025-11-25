// Payments API - Get specific payment
import { NextRequest } from 'next/server';
import { paymentService } from '@/src/modules/payments/services/payment.service';
import { requireAuth } from '@/src/common/middleware/auth';
import { handleError, successResponse } from '@/src/common/middleware/error-handler';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth();
    const payment = await paymentService.getPaymentById(params.id, auth.userId);
    
    return successResponse(payment);
  } catch (error) {
    return handleError(error);
  }
}
