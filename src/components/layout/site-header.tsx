"use client";

import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { useAppointmentModal } from "@/components/providers/appointment-modal-provider";

const navItems = [
  { label: "Home", href: "#hero" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Our Team", href: "#doctors" },
  { label: "Health Articles", href: "#articles" },
  { label: "Contact", href: "#contact" },
];

export function SiteHeader({ adminSlot }: { adminSlot?: React.ReactNode }) {
  const { openAppointmentModal } = useAppointmentModal();

  return (
    <header className="sticky top-0 z-50 border-b border-red-950/10 bg-[#f8f2e8]/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a
          href="#hero"
          className="flex items-center gap-2 text-sm font-semibold text-red-900 sm:text-base"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-red-800 to-amber-600 text-xs text-amber-100">
            H
          </span>
          He An TCM Clinic
        </a>
        <nav className="hidden items-center gap-6 text-sm text-stone-700 lg:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="transition hover:text-red-800"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <Show when="signed-out">
            <SignInButton>
              <button
                type="button"
                className="text-xs text-stone-700 transition hover:text-red-800 sm:text-sm"
              >
                Sign In
              </button>
            </SignInButton>
            <SignUpButton>
              <button
                type="button"
                className="text-xs text-stone-700 transition hover:text-red-800 sm:text-sm"
              >
                Sign Up
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            {adminSlot}
            <UserButton />
          </Show>
          <button
            type="button"
            onClick={openAppointmentModal}
            className="rounded-full bg-red-800 px-4 py-2 text-xs font-medium text-amber-100 transition hover:bg-red-700 sm:text-sm"
          >
            Book an Appointment
          </button>
        </div>
      </div>
    </header>
  );
}
