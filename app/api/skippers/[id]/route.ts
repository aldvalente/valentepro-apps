// Skippers API - Get specific skipper
import { NextRequest } from 'next/server';
import { skipperService } from '@/src/modules/skippers/services/skipper.service';
import { updateSkipperProfileSchema } from '@/src/modules/users/validators/user.validator';
import { requireAuth } from '@/src/common/middleware/auth';
import { handleError, successResponse } from '@/src/common/middleware/error-handler';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const skipper = await skipperService.getSkipperById(params.id);
    return successResponse(skipper);
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
    
    if (auth.userId !== params.id) {
      return handleError(new Error('Forbidden'));
    }
    
    const body = await req.json();
    const data = updateSkipperProfileSchema.parse(body);
    const skipper = await skipperService.updateSkipperProfile(auth.userId, data);
    
    return successResponse(skipper);
  } catch (error) {
    return handleError(error);
  }
}
