import { SectionHeading } from "@/components/ui/section-heading";
import { findAdminPage } from "./nav";

export function AdminPlaceholder({ href }: { href: string }) {
  const page = findAdminPage(href);

  if (!page) return null;

  return (
    <div>
      <SectionHeading eyebrow={page.group.label} title={page.item.label} description={page.item.description} />
      <div className="mt-8 rounded-3xl border border-dashed border-red-900/20 bg-white/70 px-6 py-14 text-center text-sm text-stone-500">
        此功能即將推出。
      </div>
    </div>
  );
}
