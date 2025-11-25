// Boats API - List and Create
import { NextRequest } from 'next/server';
import { boatService } from '@/src/modules/boats/services/boat.service';
import { createBoatSchema, boatSearchSchema } from '@/src/modules/boats/validators/boat.validator';
import { requireOwner } from '@/src/common/middleware/auth';
import { handleError, successResponse } from '@/src/common/middleware/error-handler';
import { parseSearchParams } from '@/src/common/utils/helpers';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const params = parseSearchParams(searchParams);

    // Validate and parse filters
    const filters = boatSearchSchema.parse(params);

    const result = await boatService.searchBoats(filters);

    return successResponse(result);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireOwner();
    const body = await req.json();

    // Validate input
    const data = createBoatSchema.parse(body);

    const boat = await boatService.createBoat(auth.userId, data);

    return successResponse(boat, 201);
  } catch (error) {
    return handleError(error);
  }
}
