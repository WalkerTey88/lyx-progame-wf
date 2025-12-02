export const metadata = {
  title: "Walter Farm – Segamat, Johor",
  description: "A family-friendly farm experience in Segamat, Johor.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}