"use client";

import { useAppointmentModal } from "@/components/providers/appointment-modal-provider";

export function HeroBanner() {
  const { openAppointmentModal } = useAppointmentModal();

  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-[radial-gradient(circle_at_20%_20%,rgba(245,197,107,0.28),transparent_42%),radial-gradient(circle_at_80%_30%,rgba(112,26,26,0.35),transparent_38%),linear-gradient(135deg,#2b120f_0%,#5b1f17_45%,#7b2d1c_100%)]"
    >
      <div className="absolute inset-0 bg-[url('/window.svg')] opacity-10" />
      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-20 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-28">
        <div className="max-w-2xl text-amber-50">
          <p className="mb-4 text-xs tracking-[0.28em] text-amber-200/90">Ancient Wisdom. Modern Wellness.</p>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
            He An Traditional Chinese Medicine Clinic
            <span className="mt-2 block text-2xl font-normal text-amber-200 sm:text-3xl">Traditional Chinese Medicine | Acupuncture | Holistic Wellness</span>
          </h1>
          <p className="mt-6 max-w-xl text-sm leading-7 text-amber-100/90 sm:text-base">
            Rooted in individualized care and informed by modern practice, we support your health from acute concerns to long-term wellness.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={openAppointmentModal}
              className="rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-red-950 transition hover:bg-amber-200"
            >
              Book an Appointment
            </button>
          </div>
        </div>
        <div className="w-full max-w-md rounded-3xl border border-amber-300/20 bg-amber-50/10 p-6 backdrop-blur">
          <p className="text-xs tracking-[0.2em] text-amber-200">CLINIC HOURS</p>
          <div className="mt-4 space-y-3 text-sm text-amber-50/90">
            <div className="flex justify-between border-b border-amber-100/20 pb-2">
              <span>Monday–Friday</span>
              <span>09:00 - 21:00</span>
            </div>
            <div className="flex justify-between border-b border-amber-100/20 pb-2">
              <span>Saturday</span>
              <span>09:00 - 18:00</span>
            </div>
            <div className="flex justify-between">
              <span>Sunday &amp; Holidays</span>
              <span>Closed</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
