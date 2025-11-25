// Reviews API - List and create reviews
import { NextRequest } from 'next/server';
import { reviewService } from '@/src/modules/reviews/services/review.service';
import { createReviewSchema, reviewFiltersSchema } from '@/src/modules/reviews/validators/review.validator';
import { requireAuth, getOptionalAuth } from '@/src/common/middleware/auth';
import { handleError, successResponse } from '@/src/common/middleware/error-handler';
import { parseSearchParams } from '@/src/common/utils/helpers';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const params = parseSearchParams(searchParams);
    
    const targetId = searchParams.get('targetId');
    const targetType = searchParams.get('targetType');
    
    if (targetId && targetType) {
      const filters = reviewFiltersSchema.parse(params);
      const result = await reviewService.getReviewsForTarget(targetId, targetType, filters);
      return successResponse(result);
    }
    
    // Get user's reviews
    const auth = await requireAuth();
    const result = await reviewService.getUserReviews(auth.userId, params);
    return successResponse(result);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    const body = await req.json();
    
    const data = createReviewSchema.parse(body);
    const review = await reviewService.createReview(auth.userId, data);
    
    return successResponse(review, 201);
  } catch (error) {
    return handleError(error);
  }
}
