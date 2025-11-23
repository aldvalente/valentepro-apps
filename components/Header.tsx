'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import Logo from './Logo';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
  const { data: session } = useSession();
  const t = useTranslations('nav');

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex-shrink-0">
            <Logo />
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-primary-600 font-medium"
            >
              {t('explore')}
            </Link>
            {session && (
              <>
                <Link
                  href="/dashboard/equipment"
                  className="text-gray-700 hover:text-primary-600 font-medium"
                >
                  {t('myEquipment')}
                </Link>
                <Link
                  href="/dashboard/bookings"
                  className="text-gray-700 hover:text-primary-600 font-medium"
                >
                  {t('myBookings')}
                </Link>
                <Link
                  href="/dashboard/profile"
                  className="text-gray-700 hover:text-primary-600 font-medium"
                >
                  {t('profile')}
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            
            {session ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700">
                  {session.user?.name || session.user?.email}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  {t('logout')}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/signin"
                  className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  {t('login')}
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700"
                >
                  {t('signup')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
