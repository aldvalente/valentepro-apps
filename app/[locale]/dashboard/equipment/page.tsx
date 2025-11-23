'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';

interface Equipment {
  id: string;
  title: string;
  images: string[];
  sportType: string;
  dailyPrice: number;
  isActive: boolean;
}

export default function MyEquipmentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations('dashboard');
  const tCommon = useTranslations('common');
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      fetchEquipment();
    }
  }, [status, router]);

  const fetchEquipment = async () => {
    try {
      const res = await fetch('/api/equipment');
      const data = await res.json();
      // Filter to show only user's equipment
      const myEquipment = data.filter(
        (item: any) => item.owner.id === (session?.user as any)?.id
      );
      setEquipment(myEquipment);
    } catch (error) {
      console.error('Failed to fetch equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/equipment/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (res.ok) {
        fetchEquipment();
      }
    } catch (error) {
      console.error('Failed to update equipment:', error);
    }
  };

  const deleteEquipment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this equipment?')) return;

    try {
      const res = await fetch(`/api/equipment/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchEquipment();
      }
    } catch (error) {
      console.error('Failed to delete equipment:', error);
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

  const defaultImage = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('myEquipment')}</h1>
        <Link
          href="/dashboard/equipment/new"
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
        >
          {t('addEquipment')}
        </Link>
      </div>

      {equipment.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg mb-6">{t('noEquipment')}</p>
          <Link
            href="/dashboard/equipment/new"
            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
          >
            {t('addEquipment')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {equipment.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="relative h-48">
                <Image
                  src={item.images[0] || defaultImage}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {item.isActive ? t('active') : t('inactive')}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1 truncate">{item.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{item.sportType}</p>
                <p className="text-xl font-bold text-primary-600 mb-4">
                  €{item.dailyPrice}/day
                </p>

                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/equipment/edit/${item.id}`}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center text-sm font-medium"
                  >
                    {tCommon('edit')}
                  </Link>
                  <button
                    onClick={() => toggleActive(item.id, item.isActive)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
                  >
                    {item.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => deleteEquipment(item.id)}
                    className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 text-sm font-medium"
                  >
                    {tCommon('delete')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
