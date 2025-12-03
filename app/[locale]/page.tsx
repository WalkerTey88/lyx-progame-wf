'use client';

import Hero from '../../components/ui/Hero';
import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations('Home');

  return (
    <div>
      <Hero title={t('title')} subtitle={t('subtitle')} />
    </div>
  );
}
