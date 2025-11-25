// Payments API - List and process payments
import { NextRequest } from 'next/server';
import { paymentService } from '@/src/modules/payments/services/payment.service';
import { processPaymentSchema } from '@/src/modules/payments/validators/payment.validator';
import { requireAuth } from '@/src/common/middleware/auth';
import { handleError, successResponse } from '@/src/common/middleware/error-handler';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth();
    const searchParams = req.nextUrl.searchParams;
    
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 20;
    const status = searchParams.get('status') || undefined;
    
    const result = await paymentService.getUserPayments(auth.userId, { page, limit, status });
    
    return successResponse(result);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    const body = await req.json();
    
    const data = processPaymentSchema.parse(body);
    const payment = await paymentService.processPayment(auth.userId, data);
    
    return successResponse(payment, 201);
  } catch (error) {
    return handleError(error);
  }
}
