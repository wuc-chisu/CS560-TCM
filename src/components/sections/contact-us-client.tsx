"use client";

import { useAppointmentModal } from "@/components/providers/appointment-modal-provider";
import { ContactForm } from "@/components/forms/contact-form";
import { SectionHeading } from "@/components/ui/section-heading";

type ContactUsClientProps = {
  doctorOptions: string[];
  serviceOptions: string[];
};

export function ContactUsClient({ doctorOptions, serviceOptions }: ContactUsClientProps) {
  const { openAppointmentModal } = useAppointmentModal();

  return (
    <section id="contact" className="bg-[#f8f2e8] py-16 sm:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="CONTACT"
          title="Contact Us"
          description="Book an appointment or send us a message. Our team will be happy to help."
          center
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div className="rounded-2xl border border-red-900/10 bg-[#fffaf1] p-6">
            <h3 className="text-xl font-semibold text-red-900">Clinic Information</h3>
            <div className="mt-4 space-y-2 text-sm leading-7 text-stone-700">
              <p>Phone: 02-2712-5678</p>
              <p>Address: 5F, No. 88, Section 3, Nanjing East Road, Zhongshan District, Taipei, Taiwan</p>
              <p>Hours: Monday–Friday, 9:00 AM–9:00 PM | Saturday, 9:00 AM–6:00 PM</p>
              <p>Email: service@heanclinic.com.tw</p>
            </div>
            <div className="mt-6 h-56 rounded-xl border border-stone-200 bg-[linear-gradient(135deg,#f4ece2_0%,#e6d6c2_100%)] p-4 text-xs text-stone-500">
              Map (Google Maps can be embedded here)
            </div>
          </div>

          <div className="space-y-6">
            <ContactForm />
          </div>
        </div>
      </div>

    </section>
  );
}
