import { AppointmentForm } from "@/components/forms/appointment-form";
import { ContactForm } from "@/components/forms/contact-form";
import { SectionHeading } from "@/components/ui/section-heading";

export function ContactUs() {
  return (
    <section id="contact" className="bg-[#f8f2e8] py-16 sm:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="CONTACT"
          title="聯絡我們"
          description="歡迎透過線上預約與聯絡表單，我們將由專人盡快為您安排門診時段。"
          center
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div className="rounded-2xl border border-red-900/10 bg-[#fffaf1] p-6">
            <h3 className="text-xl font-semibold text-red-900">診所資訊</h3>
            <div className="mt-4 space-y-2 text-sm leading-7 text-stone-700">
              <p>電話：02-2712-5678</p>
              <p>地址：台北市中山區南京東路三段 88 號 5 樓</p>
              <p>門診：週一至五 09:00-21:00｜週六 09:00-18:00</p>
              <p>信箱：service@heanclinic.com.tw</p>
            </div>
            <div className="mt-6 h-56 rounded-xl border border-stone-200 bg-[linear-gradient(135deg,#f4ece2_0%,#e6d6c2_100%)] p-4 text-xs text-stone-500">
              地圖區塊（可嵌入 Google Maps iframe）
            </div>
          </div>
          <div className="space-y-6">
            <AppointmentForm />
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
