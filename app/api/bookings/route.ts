import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createBookingSchema = z.object({
  equipmentId: z.string(),
  startDate: z.string(),
  endDate: z.string(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const asOwner = searchParams.get('asOwner') === 'true';

    let bookings;

    if (asOwner) {
      // Get bookings for user's equipment
      bookings = await prisma.booking.findMany({
        where: {
          equipment: {
            ownerId: (session.user as any).id,
          },
        },
        include: {
          equipment: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else {
      // Get bookings where user is the renter
      bookings = await prisma.booking.findMany({
        where: {
          userId: (session.user as any).id,
        },
        include: {
          equipment: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    return NextResponse.json(bookings);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { equipmentId, startDate, endDate } = createBookingSchema.parse(body);

    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId },
    });

    if (!equipment) {
      return NextResponse.json(
        { error: 'Equipment not found' },
        { status: 404 }
      );
    }

    if (!equipment.isActive) {
      return NextResponse.json(
        { error: 'Equipment is not active' },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    if (days <= 0) {
      return NextResponse.json(
        { error: 'Invalid date range' },
        { status: 400 }
      );
    }

    const totalPrice = days * equipment.dailyPrice;

    const booking = await prisma.booking.create({
      data: {
        userId: (session.user as any).id,
        equipmentId,
        startDate: start,
        endDate: end,
        totalPrice,
        status: 'REQUESTED',
      },
      include: {
        equipment: true,
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
