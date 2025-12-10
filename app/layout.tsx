// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
// @ts-ignore  // 临时忽略 TS 对 @vercel/speed-insights/next 的类型检查
import { SpeedInsights } from "@vercel/speed-insights/next";


export const metadata: Metadata = {
  title: "Walters Farm Segamat",
  description:
    "Walters Farm Segamat is a family-friendly recreational farm in Johor with mini zoo, kids water park, outdoor activities, food court & café, and farmstay chalets.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>

        {/* Vercel Speed Insights，全局性能监控 */}
        <SpeedInsights />
      </body>
    </html>
  );
}
