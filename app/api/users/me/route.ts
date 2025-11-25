// Users API - Current user profile
import { NextRequest } from 'next/server';
import { userService } from '@/src/modules/users/services/user.service';
import { updateUserSchema } from '@/src/modules/users/validators/user.validator';
import { requireAuth } from '@/src/common/middleware/auth';
import { handleError, successResponse } from '@/src/common/middleware/error-handler';

export async function GET() {
  try {
    const auth = await requireAuth();
    const user = await userService.getUserById(auth.userId, true);
    const stats = await userService.getUserStats(auth.userId);
    
    return successResponse({ ...user, stats });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireAuth();
    const body = await req.json();
    
    const data = updateUserSchema.parse(body);
    const user = await userService.updateUser(auth.userId, data);
    
    return successResponse(user);
  } catch (error) {
    return handleError(error);
  }
}
