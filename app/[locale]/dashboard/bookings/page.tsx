'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

interface Booking {
  id: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  equipment: {
    id: string;
    title: string;
    images: string[];
  };
  user?: {
    name: string;
    email: string;
  };
}

export default function MyBookingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations('bookings');
  const [asRenter, setAsRenter] = useState<Booking[]>([]);
  const [asOwner, setAsOwner] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      fetchBookings();
    }
  }, [status, router]);

  const fetchBookings = async () => {
    try {
      const [renterRes, ownerRes] = await Promise.all([
        fetch('/api/bookings'),
        fetch('/api/bookings?asOwner=true'),
      ]);

      const renterData = await renterRes.json();
      const ownerData = await ownerRes.json();

      setAsRenter(renterData);
      setAsOwner(ownerData);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'REQUESTED':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderBookingCard = (booking: Booking, showUser: boolean = false) => (
    <div key={booking.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <Link
            href={`/equipment/${booking.equipment.id}`}
            className="text-lg font-semibold text-gray-900 hover:text-primary-600"
          >
            {booking.equipment.title}
          </Link>
          {showUser && booking.user && (
            <p className="text-sm text-gray-600 mt-1">
              {t('renter')}: {booking.user.name}
            </p>
          )}
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
          {t(booking.status.toLowerCase())}
        </span>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>{t('dates')}:</span>
          <span>
            {new Date(booking.startDate).toLocaleDateString()} -{' '}
            {new Date(booking.endDate).toLocaleDateString()}
          </span>
        </div>
        <div className="flex justify-between font-medium text-gray-900">
          <span>{t('total')}:</span>
          <span>€{booking.totalPrice}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('title')}</h1>

      <div className="space-y-12">
        {/* As Renter */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('asRenter')}</h2>
          {asRenter.length === 0 ? (
            <p className="text-gray-600">{t('noBookings')}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {asRenter.map((booking) => renderBookingCard(booking, false))}
            </div>
          )}
        </div>

        {/* As Owner */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('asOwner')}</h2>
          {asOwner.length === 0 ? (
            <p className="text-gray-600">{t('noBookings')}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {asOwner.map((booking) => renderBookingCard(booking, true))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
