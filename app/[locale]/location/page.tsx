'use client';

import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useTranslations } from 'next-intl';

export default function LocationPage() {
  const t = useTranslations('Location');

  return (
    <div className="space-y-4">
      <Card title={t('title')}>
        <p className="mb-4">Overview of how to find Walter Farm.</p>
        <Button>View map</Button>
      </Card>
    </div>
  );
}
