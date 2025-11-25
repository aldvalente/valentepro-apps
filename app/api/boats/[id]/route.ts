// Boats API - Get, Update, Delete specific boat
import { NextRequest } from 'next/server';
import { boatService } from '@/src/modules/boats/services/boat.service';
import { updateBoatSchema } from '@/src/modules/boats/validators/boat.validator';
import { requireAuth } from '@/src/common/middleware/auth';
import { handleError, successResponse } from '@/src/common/middleware/error-handler';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const boat = await boatService.getBoatById(params.id);
    return successResponse(boat);
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
    
    const data = updateBoatSchema.parse(body);
    const boat = await boatService.updateBoat(params.id, auth.userId, data);
    
    return successResponse(boat);
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
    await boatService.deleteBoat(params.id, auth.userId);
    
    return successResponse({ message: 'Boat deleted successfully' });
  } catch (error) {
    return handleError(error);
  }
}
