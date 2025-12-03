'use client';

import { useState } from 'react';
import Link from 'next-intl/link';
import { useTranslations, useLocale } from 'next-intl';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const t = useTranslations('Navbar');
  const locale = useLocale();

  const navItems = [
    { href: '/accommodation', labelKey: 'accommodation' },
    { href: '/activities', labelKey: 'activities' },
    { href: '/facilities', labelKey: 'facilities' },
    { href: '/gallery', labelKey: 'gallery' },
    { href: '/location', labelKey: 'location' },
    { href: '/booking', labelKey: 'booking' },
    { href: '/contact', labelKey: 'contact' }
  ];

  return (
    <nav className="border-b bg-white">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" locale={locale} className="font-bold text-xl">
          Walter Farm
        </Link>

        <div className="flex items-center space-x-3">
          <div className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} locale={locale}>
                {t(item.labelKey)}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-2 text-sm">
            <Link href="/" locale="en">
              EN
            </Link>
            <span>|</span>
            <Link href="/" locale="zh">
              中文
            </Link>
          </div>

          <button
            className="md:hidden border px-3 py-1 rounded"
            onClick={() => setOpen(!open)}
          >
            {t('menu')}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden px-4 py-2 border-t">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} locale={locale} onClick={() => setOpen(false)}>
                  {t(item.labelKey)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
