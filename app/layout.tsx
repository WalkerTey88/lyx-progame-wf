import "./globals.css";
import Header from "../components/ui/Header";
import Footer from "../components/ui/Footer";

export const metadata = {
  title: "Walter Farm Segamat",
  description: "A peaceful farmstay experience in Segamat, Malaysia.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main className="container mx-auto p-4">{children}</main>
        <Footer />
      </body>
    </html>
  );
}