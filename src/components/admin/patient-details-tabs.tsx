"use client";

import { SectionHeading } from "@/components/ui/section-heading";
import { useState } from "react";

type PatientDetailsTabsProps = {
  patient: {
    name: string;
    dateOfBirth: string;
    phone: string;
  };
};

const tabs = ["Overview", "Medical History", "Visits"] as const;
type Tab = (typeof tabs)[number];

export function PatientDetailsTabs({ patient }: PatientDetailsTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("Overview");

  return (
    <div>
      <SectionHeading
        eyebrow="MEDICAL RECORDS"
        title="Patient Details"
        description={patient.name ? `View basic information and visit details for ${patient.name}.` : "View basic patient information and visit details."}
      />

      <div className="mt-8 border-b border-red-900/15">
        <div role="group" aria-label="Patient information sections" className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              aria-pressed={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={[
                "shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition",
                activeTab === tab
                  ? "border-red-800 text-red-900"
                  : "border-transparent text-stone-500 hover:text-red-800",
              ].join(" ")}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <section aria-live="polite" className="mt-6 rounded-3xl border border-red-900/10 bg-white/90 p-5 shadow-lg shadow-red-950/5 sm:p-7">
        {activeTab === "Overview" ? (
          <div>
            <h3 className="text-lg font-semibold text-stone-900">Overview</h3>
            <dl className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
              <Detail label="Patient Name" value={patient.name || "—"} />
              <Detail label="DOB" value={patient.dateOfBirth ? formatDate(patient.dateOfBirth) : "—"} />
              <Detail label="Phone" value={patient.phone || "—"} />
            </dl>
          </div>
        ) : null}
        {activeTab === "Medical History" ? (
          <EmptyState title="Medical History" message="No medical history is available." />
        ) : null}
        {activeTab === "Visits" ? (
          <EmptyState title="Visits" message="No visit records are available." />
        ) : null}
      </section>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-amber-800">{label}</dt>
      <dd className="mt-1 text-sm text-stone-800">{value}</dd>
    </div>
  );
}

function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-stone-900">{title}</h3>
      <p className="mt-5 border-t border-red-900/10 pt-5 text-sm text-stone-500">{message}</p>
    </div>
  );
}

function formatDate(value: string) {
  const [year, month, day] = value.split("-");
  return `${month}/${day}/${year}`;
}