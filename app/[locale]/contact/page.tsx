'use client';

import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useTranslations } from 'next-intl';

export default function ContactPage() {
  const t = useTranslations('Contact');

  return (
    <div className="space-y-4">
      <Card title={t('title')}>
        <p className="mb-4">Overview of contact channels.</p>
        <Button>Contact us</Button>
      </Card>
    </div>
  );
}
