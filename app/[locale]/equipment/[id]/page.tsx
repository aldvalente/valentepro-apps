'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
});

interface Equipment {
  id: string;
  title: string;
  description: string;
  sportType: string;
  dailyPrice: number;
  locationAddress: string;
  latitude: number;
  longitude: number;
  images: string[];
  owner: {
    id: string;
    name: string;
    email: string;
  };
  reviews: Array<{
    id: string;
    rating: number;
    comment: string;
    user: {
      name: string;
    };
    createdAt: string;
  }>;
  avgRating: number;
  reviewCount: number;
}

export default function EquipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session } = useSession();
  const router = useRouter();
  const t = useTranslations('equipment');
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [equipmentId, setEquipmentId] = useState<string | null>(null);

  // Unwrap params
  useEffect(() => {
    params.then(p => setEquipmentId(p.id));
  }, [params]);

  useEffect(() => {
    if (equipmentId) {
      fetchEquipment();
    }
  }, [equipmentId]);

  const fetchEquipment = async () => {
    if (!equipmentId) return;
    try {
      const res = await fetch(`/api/equipment/${equipmentId}`);
      const data = await res.json();
      setEquipment(data);
    } catch (error) {
      console.error('Failed to fetch equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (!startDate || !endDate) {
      alert('Please select start and end dates');
      return;
    }

    if (!equipmentId) return;

    setBookingLoading(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipmentId: equipmentId,
          startDate,
          endDate,
        }),
      });

      if (res.ok) {
        alert('Booking requested successfully!');
        router.push('/dashboard/bookings');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create booking');
      }
    } catch (error) {
      alert('Failed to create booking');
    } finally {
      setBookingLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!startDate || !endDate || !equipment) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days * equipment.dailyPrice : 0;
  };

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200 rounded-xl mb-6" />
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-8" />
        </div>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-center text-gray-600">Equipment not found</p>
      </div>
    );
  }

  const defaultImage = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Images */}
          <div className="relative h-96 rounded-xl overflow-hidden">
            <Image
              src={equipment.images[0] || defaultImage}
              alt={equipment.title}
              fill
              className="object-cover"
            />
          </div>

          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium">
                {equipment.sportType}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {equipment.title}
            </h1>
            <div className="flex items-center gap-4 text-gray-600">
              {equipment.avgRating > 0 && (
                <div className="flex items-center gap-1">
                  <span>⭐</span>
                  <span className="font-medium">{equipment.avgRating.toFixed(1)}</span>
                  <span>({equipment.reviewCount} {t('reviews')})</span>
                </div>
              )}
              <span>{equipment.locationAddress}</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-xl font-bold mb-4">{t('description')}</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{equipment.description}</p>
          </div>

          {/* Map */}
          <div>
            <h2 className="text-xl font-bold mb-4">{t('location')}</h2>
            <div className="h-96 rounded-xl overflow-hidden">
              <Map
                locations={[
                  {
                    id: equipment.id,
                    latitude: equipment.latitude,
                    longitude: equipment.longitude,
                    title: equipment.title,
                    dailyPrice: equipment.dailyPrice,
                  },
                ]}
                center={[equipment.latitude, equipment.longitude]}
                zoom={13}
              />
            </div>
            <p className="mt-2 text-gray-600">{equipment.locationAddress}</p>
          </div>

          {/* Reviews */}
          <div>
            <h2 className="text-xl font-bold mb-4">{t('reviews')}</h2>
            {equipment.reviews.length > 0 ? (
              <div className="space-y-4">
                {equipment.reviews.map((review) => (
                  <div key={review.id} className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{review.user.name}</span>
                      <span className="text-yellow-500">{'⭐'.repeat(review.rating)}</span>
                    </div>
                    {review.comment && (
                      <p className="text-gray-700">{review.comment}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-2">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">{t('noReviews')}</p>
            )}
          </div>
        </div>

        {/* Booking Sidebar */}
        <div className="lg:sticky lg:top-24 h-fit">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-primary-600">
                  €{equipment.dailyPrice}
                </span>
                <span className="text-gray-600">/ {t('pricePerDay')}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('startDate')}
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('endDate')}
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {startDate && endDate && calculateDays() > 0 && (
                <div className="py-4 border-t border-b border-gray-200">
                  <div className="flex justify-between mb-2">
                    <span>€{equipment.dailyPrice} × {calculateDays()} {t('days')}</span>
                    <span>€{calculateTotal()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>{t('totalPrice')}</span>
                    <span>€{calculateTotal()}</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleBooking}
                disabled={bookingLoading || !startDate || !endDate}
                className="w-full py-3 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bookingLoading ? 'Processing...' : t('requestBooking')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
