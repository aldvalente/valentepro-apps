// Skippers API - List and search skippers
import { NextRequest } from 'next/server';
import { skipperService } from '@/src/modules/skippers/services/skipper.service';
import { skipperSearchSchema, createSkipperProfileSchema } from '@/src/modules/users/validators/user.validator';
import { requireAuth } from '@/src/common/middleware/auth';
import { handleError, successResponse } from '@/src/common/middleware/error-handler';
import { parseSearchParams } from '@/src/common/utils/helpers';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const params = parseSearchParams(searchParams);
    
    const filters = skipperSearchSchema.parse(params);
    const result = await skipperService.searchSkippers(filters);
    
    return successResponse(result);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    const body = await req.json();
    
    const data = createSkipperProfileSchema.parse(body);
    const skipper = await skipperService.createSkipperProfile(auth.userId, data);
    
    return successResponse(skipper, 201);
  } catch (error) {
    return handleError(error);
  }
}
