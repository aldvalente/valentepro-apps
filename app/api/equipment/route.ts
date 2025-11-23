import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createEquipmentSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  sportType: z.string().min(1),
  dailyPrice: z.number().positive(),
  locationAddress: z.string().min(1),
  latitude: z.number(),
  longitude: z.number(),
  images: z.array(z.string()).default([]),
});

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const sportType = searchParams.get('sportType');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const location = searchParams.get('location');

    const where: any = { isActive: true };

    if (sportType && sportType !== 'all') {
      where.sportType = sportType;
    }

    if (minPrice || maxPrice) {
      where.dailyPrice = {};
      if (minPrice) where.dailyPrice.gte = parseFloat(minPrice);
      if (maxPrice) where.dailyPrice.lte = parseFloat(maxPrice);
    }

    if (location) {
      where.locationAddress = {
        contains: location,
        mode: 'insensitive',
      };
    }

    const equipment = await prisma.equipment.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate average rating and review count
    const equipmentWithStats = equipment.map((item) => {
      const avgRating =
        item.reviews.length > 0
          ? item.reviews.reduce((sum, r) => sum + r.rating, 0) /
            item.reviews.length
          : 0;
      return {
        ...item,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: item.reviews.length,
        reviews: undefined,
      };
    });

    return NextResponse.json(equipmentWithStats);
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
    const data = createEquipmentSchema.parse(body);

    const equipment = await prisma.equipment.create({
      data: {
        ...data,
        ownerId: (session.user as any).id,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(equipment, { status: 201 });
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
