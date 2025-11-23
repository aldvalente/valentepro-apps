'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface EquipmentCardProps {
  id: string;
  title: string;
  images: string[];
  sportType: string;
  locationAddress: string;
  dailyPrice: number;
  avgRating?: number;
  reviewCount?: number;
}

export default function EquipmentCard({
  id,
  title,
  images,
  sportType,
  locationAddress,
  dailyPrice,
  avgRating,
  reviewCount,
}: EquipmentCardProps) {
  const t = useTranslations('explore');
  const defaultImage = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500';

  return (
    <Link href={`/equipment/${id}`} className="group">
      <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden">
        <div className="relative h-64 w-full overflow-hidden">
          <Image
            src={images[0] || defaultImage}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-lg text-xs font-medium">
            {sportType}
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-1 truncate">{title}</h3>
          <p className="text-sm text-gray-600 mb-2 truncate">
            {locationAddress}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {avgRating && avgRating > 0 ? (
                <>
                  <span className="text-sm">⭐</span>
                  <span className="text-sm font-medium">{avgRating.toFixed(1)}</span>
                  <span className="text-sm text-gray-500">
                    ({reviewCount || 0} {t('reviews')})
                  </span>
                </>
              ) : (
                <span className="text-sm text-gray-500">No reviews yet</span>
              )}
            </div>
          </div>
          
          <div className="mt-2 flex items-baseline">
            <span className="text-xl font-bold text-primary-600">
              €{dailyPrice}
            </span>
            <span className="text-sm text-gray-600 ml-1">
              / {t('pricePerDay')}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
