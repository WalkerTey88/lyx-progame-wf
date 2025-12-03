'use client';

import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('Footer');
  const year = new Date().getFullYear();

  return (
    <footer className="border-t mt-10 py-4 text-center text-sm text-gray-500">
      <p>
        © {year} Walter Farm. {t('rights')}
      </p>
    </footer>
  );
}
