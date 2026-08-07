"use client";

import { AppointmentForm } from "@/components/forms/appointment-form";
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type AppointmentModalContextValue = {
  isOpen: boolean;
  openAppointmentModal: () => void;
  closeAppointmentModal: () => void;
};

const AppointmentModalContext = createContext<AppointmentModalContextValue | null>(null);

type AppointmentModalProviderProps = {
  children: ReactNode;
  doctorOptions: string[];
  serviceOptions: string[];
};

export function AppointmentModalProvider({ children, doctorOptions, serviceOptions }: AppointmentModalProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const closeAppointmentModal = () => setIsOpen(false);

  const value = useMemo<AppointmentModalContextValue>(
    () => ({
      isOpen,
      openAppointmentModal: () => setIsOpen(true),
      closeAppointmentModal,
    }),
    [isOpen],
  );

  return (
    <AppointmentModalContext.Provider value={value}>
      {children}
      {isOpen ? (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Appointment form"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-red-900/10 bg-[#fffaf1] p-4 shadow-2xl shadow-red-950/20 sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-red-900">門診預約</h3>
                <p className="mt-1 text-sm text-stone-600">請填寫您的需求，我們將盡快與您聯絡。</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-stone-300 bg-white px-3 py-1 text-sm text-stone-600 transition hover:bg-stone-100"
              >
                關閉
              </button>
            </div>
            <AppointmentForm doctorOptions={doctorOptions} serviceOptions={serviceOptions} onClose={closeAppointmentModal} />
          </div>
        </div>
      ) : null}
    </AppointmentModalContext.Provider>
  );
}

export function useAppointmentModal() {
  const context = useContext(AppointmentModalContext);

  if (!context) {
    throw new Error("useAppointmentModal must be used within an AppointmentModalProvider");
  }

  return context;
}
