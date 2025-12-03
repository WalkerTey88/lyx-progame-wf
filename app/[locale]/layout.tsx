import '../globals.css';
import { NextIntlClientProvider } from 'next-intl';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import React from 'react';

export const metadata = {
  title: 'Walter Farm',
  description: 'Walter Farm official website'
};

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = (await import(`../../messages/${params.locale}.json`)).default;

  return (
    <html lang={params.locale}>
      <body className="min-h-screen flex flex-col">
        <NextIntlClientProvider messages={messages} locale={params.locale}>
          <Navbar />
          <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6">
            {children}
          </main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
