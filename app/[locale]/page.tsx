'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import EquipmentCard from '@/components/EquipmentCard';
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-200 animate-pulse rounded-lg" />
});

interface Equipment {
  id: string;
  title: string;
  images: string[];
  sportType: string;
  locationAddress: string;
  latitude: number;
  longitude: number;
  dailyPrice: number;
  avgRating?: number;
  reviewCount?: number;
}

export default function HomePage() {
  const t = useTranslations('explore');
  const tFilters = useTranslations('filters');
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(true);
  const [filters, setFilters] = useState({
    sportType: 'all',
    minPrice: '',
    maxPrice: '',
    location: '',
  });

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async (currentFilters = filters) => {
    try {
      const params = new URLSearchParams();
      if (currentFilters.sportType !== 'all') params.append('sportType', currentFilters.sportType);
      if (currentFilters.minPrice) params.append('minPrice', currentFilters.minPrice);
      if (currentFilters.maxPrice) params.append('maxPrice', currentFilters.maxPrice);
      if (currentFilters.location) params.append('location', currentFilters.location);

      const res = await fetch(`/api/equipment?${params.toString()}`);
      
      if (!res.ok) {
        console.error('Failed to fetch equipment: Server returned', res.status);
        setEquipment([]);
        return;
      }
      
      const data = await res.json();
      
      // Ensure data is an array before setting state
      if (Array.isArray(data)) {
        setEquipment(data);
      } else {
        console.error('Invalid response format:', data);
        setEquipment([]);
      }
    } catch (error) {
      console.error('Failed to fetch equipment:', error);
      setEquipment([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setLoading(true);
    fetchEquipment();
  };

  const clearFilters = () => {
    const newFilters = {
      sportType: 'all',
      minPrice: '',
      maxPrice: '',
      location: '',
    };
    setFilters(newFilters);
    setLoading(true);
    fetchEquipment(newFilters);
  };

  const mapLocations = Array.isArray(equipment) 
    ? equipment.map((item) => ({
        id: item.id,
        latitude: item.latitude,
        longitude: item.longitude,
        title: item.title,
        dailyPrice: item.dailyPrice,
      }))
    : [];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-gray-50 to-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('title')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('subtitle')}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {tFilters('sportType')}
              </label>
              <select
                value={filters.sportType}
                onChange={(e) => handleFilterChange('sportType', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">{tFilters('allSports')}</option>
                <option value="ski">{tFilters('ski')}</option>
                <option value="snowboard">{tFilters('snowboard')}</option>
                <option value="bike">{tFilters('bike')}</option>
                <option value="surf">{tFilters('surf')}</option>
                <option value="other">{tFilters('other')}</option>
              </select>
            </div>

            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {tFilters('minPrice')}
              </label>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                placeholder="€0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {tFilters('maxPrice')}
              </label>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                placeholder="€1000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {tFilters('location')}
              </label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                placeholder={tFilters('location')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={applyFilters}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
            >
              {tFilters('applyFilters')}
            </button>

            <button
              onClick={clearFilters}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              {tFilters('clearFilters')}
            </button>

            <button
              onClick={() => setShowMap(!showMap)}
              className="md:hidden px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              {showMap ? t('hideMap') : t('showMap')}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Equipment Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-96 bg-gray-200 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : equipment.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {equipment.map((item) => (
                  <EquipmentCard key={item.id} {...item} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">{t('noResults')}</p>
              </div>
            )}
          </div>

          {/* Map */}
          <div
            className={`${
              showMap ? 'block' : 'hidden'
            } md:block md:sticky md:top-32 h-[400px] md:h-[calc(100vh-200px)] md:w-[500px] flex-shrink-0`}
          >
            <Map locations={mapLocations} />
          </div>
        </div>
      </div>
    </div>
  );
}
