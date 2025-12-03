/**
 * 站点页脚组件。
 * 显示版权信息及地址。采用简洁的设计。
 */
export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-white border-t mt-8">
      <div className="container mx-auto py-4 px-4 text-sm text-neutral-500 flex flex-col md:flex-row items-center justify-between gap-2">
        <span>© {year} Walter Farm. All rights reserved.</span>
        <span>Segamat, Johor, Malaysia</span>
      </div>
    </footer>
  );
}