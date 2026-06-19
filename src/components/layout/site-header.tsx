const navItems = [
  { label: "首頁", href: "#hero" },
  { label: "診所介紹", href: "#about" },
  { label: "診療項目", href: "#services" },
  { label: "醫師團隊", href: "#doctors" },
  { label: "健康專欄", href: "#articles" },
  { label: "聯絡我們", href: "#contact" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-red-950/10 bg-[#f8f2e8]/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="#hero" className="flex items-center gap-2 text-sm font-semibold text-red-900 sm:text-base">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-red-800 to-amber-600 text-xs text-amber-100">
            和
          </span>
          和安中醫診所
        </a>
        <nav className="hidden items-center gap-6 text-sm text-stone-700 lg:flex">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="transition hover:text-red-800">
              {item.label}
            </a>
          ))}
        </nav>
        <a
          href="#contact"
          className="rounded-full bg-red-800 px-4 py-2 text-xs font-medium text-amber-100 transition hover:bg-red-700 sm:text-sm"
        >
          線上預約
        </a>
      </div>
    </header>
  );
}
