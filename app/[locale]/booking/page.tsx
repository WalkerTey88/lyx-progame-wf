'use client';

import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useTranslations } from 'next-intl';

export default function BookingPage() {
  const t = useTranslations('Booking');

  return (
    <div className="space-y-4">
      <Card title={t('title')}>
        <p className="mb-4">Overview of booking process.</p>
        <Button>Start booking</Button>
      </Card>
    </div>
  );
}
