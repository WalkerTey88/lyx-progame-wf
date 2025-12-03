'use client';

import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useTranslations } from 'next-intl';

export default function AccommodationPage() {
  const t = useTranslations('Accommodation');

  return (
    <div className="space-y-4">
      <Card title={t('title')}>
        <p className="mb-4">Basic info about accommodation options.</p>
        <Button>View details</Button>
      </Card>
    </div>
  );
}
