import Link from 'next/link';

/**
 * 站点头部导航。
 * 包含品牌名称以及导航链接。
 */
const navItems = [
  { href: '/', label: 'Home' },
  { href: '/accommodation', label: 'Accommodation' },
  { href: '/activities', label: 'Activities' },
  { href: '/booking', label: 'Booking' },
  { href: '/about', label: 'About' },
];

export default function Header() {
  return (
    <header className="bg-white border-b">
      <nav className="container mx-auto flex items-center justify-between py-4 px-4">
        {/* 品牌名称 */}
        <span className="text-lg font-semibold text-brand">Walter Farm</span>
        {/* 导航链接 */}
        <div className="flex gap-4 text-sm">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-neutral-700 hover:text-brandDark">
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}