import { SectionHeading } from "@/components/ui/section-heading";

export default function EditAppointmentPage() {
  return (
    <div>
      <SectionHeading eyebrow="預約管理" title="修改預約" description="更改預約的日期與時間。" />
      <div className="mt-8 rounded-3xl border border-dashed border-red-900/20 bg-white/70 px-6 py-14 text-center text-sm text-stone-500">
        此功能即將推出。
      </div>
    </div>
  );
}
