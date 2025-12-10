// components/Footer.tsx
export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="page-container flex flex-col gap-2 py-5 text-xs text-slate-600 md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} Walters Farm Segamat. All rights reserved.</p>
        <p className="text-[11px] text-slate-500">
          Mini zoo · Kids water park · Outdoor activities · Food court &amp; café · Farmstay.
        </p>
      </div>
    </footer>
  );
}
