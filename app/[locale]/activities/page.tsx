'use client';

import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useTranslations } from 'next-intl';

export default function ActivitiesPage() {
  const t = useTranslations('Activities');

  return (
    <div className="space-y-4">
      <Card title={t('title')}>
        <p className="mb-4">Overview of activities and experiences.</p>
        <Button>View activities</Button>
      </Card>
    </div>
  );
}
