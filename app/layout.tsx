import '../globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

export const metadata = {
  title: 'Walter Farm – Segamat, Johor',
  description: 'A family-friendly farm experience in Segamat, Johor.',
};

/**
 * 应用根布局。
 * 统一注入头部导航、尾部以及主体内容的容器。
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col font-sans">
        <Header />
        <main className="container mx-auto flex-grow px-4 py-6">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}