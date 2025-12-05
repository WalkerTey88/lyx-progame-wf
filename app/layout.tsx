import "./globals.css";
import { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata = {
  title: "Walter Farm – Segamat, Johor",
  description: "Farm stay booking in Segamat",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-800 font-sans">
        <Header />
        <main className="container mx-auto p-4">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
