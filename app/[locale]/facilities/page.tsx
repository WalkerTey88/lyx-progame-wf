'use client';

import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useTranslations } from 'next-intl';

export default function FacilitiesPage() {
  const t = useTranslations('Facilities');

  return (
    <div className="space-y-4">
      <Card title={t('title')}>
        <p className="mb-4">Overview of facilities available.</p>
        <Button>View facilities</Button>
      </Card>
    </div>
  );
}
