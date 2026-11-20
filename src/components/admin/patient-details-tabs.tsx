"use client";

import { SectionHeading } from "@/components/ui/section-heading";
import { DeletePatientButton } from "@/components/admin/delete-patient-button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type PatientDetailsTabsProps = {
  patientId?: string;
  patient: {
    name: string;
    dateOfBirth: string;
    phone: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    preferredName?: string;
    gender?: string;
    preferredLanguage?: string;
    maritalStatus?: string;
    occupation?: string;
    email?: string;
    address?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    preferredContactMethod?: string;
    emergencyFirstName?: string;
    emergencyLastName?: string;
    emergencyRelationship?: string;
    emergencyPhone?: string;
    emergencyEmail?: string;
    willUseInsurance?: boolean | null;
    insuranceProvider?: string;
    insuranceMemberId?: string;
    insuranceGroupNumber?: string;
    policyholderName?: string;
    policyholderRelationship?: string;
    policyholderDateOfBirth?: string;
    insuranceEffectiveDate?: string;
    allergies?: string;
    currentMedications?: string;
    majorMedicalConditions?: string;
    previousSurgeriesOrHospitalizations?: string;
    pregnancyStatus?: string;
    primaryCarePhysician?: string;
    primaryCarePhysicianPhone?: string;
    previousAcupunctureExperience?: string;
  };
};

const tabs = ["Overview", "Medical History", "Visits"] as const;
type Tab = (typeof tabs)[number];

export function PatientDetailsTabs({ patientId, patient }: PatientDetailsTabsProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("Overview");

  return (
    <div>
      <SectionHeading
        eyebrow="MEDICAL RECORDS"
        title="Patient Details"
        description={patient.name ? `View basic information and visit details for ${patient.name}.` : "View basic patient information and visit details."}
      />

      {patientId ? (
        <div className="mt-5 flex justify-end">
          <DeletePatientButton
            patientId={patientId}
            patientName={patient.name}
            onDeleted={() => router.push("/admin/medical-records")}
          />
        </div>
      ) : null}

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
              <Detail label="Gender / Sex" value={formatOptionValue(patient.gender)} />
              <Detail label="Preferred Name" value={patient.preferredName || "—"} />
              <Detail label="Preferred Language" value={patient.preferredLanguage || "—"} />
              <Detail label="Marital Status" value={formatOptionValue(patient.maritalStatus)} />
              <Detail label="Occupation" value={patient.occupation || "—"} />
              <Detail label="Phone" value={patient.phone || "—"} />
              <Detail label="Email" value={patient.email || "—"} />
              <Detail
                label="Address"
                value={[patient.address, patient.addressLine2, patient.city, patient.state, patient.zipCode]
                  .filter(Boolean)
                  .join(", ") || "—"}
              />
              <Detail label="Preferred Contact Method" value={formatOptionValue(patient.preferredContactMethod)} />
              <Detail
                label="Emergency Contact"
                value={[
                  [patient.emergencyFirstName, patient.emergencyLastName].filter(Boolean).join(" "),
                  patient.emergencyRelationship,
                  patient.emergencyPhone,
                  patient.emergencyEmail,
                ].filter(Boolean).join(" · ") || "—"}
              />
              <Detail label="Using Insurance" value={patient.willUseInsurance == null ? "—" : patient.willUseInsurance ? "Yes" : "No"} />
              {patient.willUseInsurance ? (
                <>
                  <Detail label="Insurance Company" value={patient.insuranceProvider || "—"} />
                  <Detail label="Member ID" value={patient.insuranceMemberId || "—"} />
                  <Detail label="Group Number" value={patient.insuranceGroupNumber || "—"} />
                  <Detail label="Policy Holder" value={patient.policyholderName || "—"} />
                  <Detail label="Policy Holder Relationship" value={patient.policyholderRelationship || "—"} />
                  <Detail label="Policy Holder DOB" value={formatDate(patient.policyholderDateOfBirth ?? "") || "—"} />
                  <Detail label="Insurance Effective Date" value={formatDate(patient.insuranceEffectiveDate ?? "") || "—"} />
                </>
              ) : null}
            </dl>
          </div>
        ) : null}
        {activeTab === "Medical History" ? (
          <div>
            <h3 className="text-lg font-semibold text-stone-900">Medical History</h3>
            <dl className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
              <Detail label="Allergies" value={patient.allergies || "—"} />
              <Detail label="Current Medications and Supplements" value={patient.currentMedications || "—"} />
              <Detail label="Major Medical Conditions" value={patient.majorMedicalConditions || "—"} />
              <Detail label="Previous Surgeries or Hospitalizations" value={patient.previousSurgeriesOrHospitalizations || "—"} />
              <Detail label="Pregnancy Status" value={formatOptionValue(patient.pregnancyStatus)} />
              <Detail label="Primary Care Physician" value={patient.primaryCarePhysician || "—"} />
              <Detail label="Primary Care Physician Phone" value={patient.primaryCarePhysicianPhone || "—"} />
              <Detail label="Previous Acupuncture Experience" value={formatOptionValue(patient.previousAcupunctureExperience)} />
            </dl>
          </div>
        ) : null}
        {activeTab === "Visits" ? (
          <div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-stone-900">Visits</h3>
                <p className="mt-2 text-sm text-stone-500">No visit records are available.</p>
              </div>
              {patientId ? (
                <Link
                  href={`/admin/medical-records/patient/encounter?id=${encodeURIComponent(patientId)}`}
                  className="inline-flex justify-center rounded-full bg-red-800 px-5 py-3 text-sm font-medium text-amber-100 transition hover:bg-red-700"
                >
                  Start New Encounter
                </Link>
              ) : null}
            </div>
          </div>
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

function formatDate(value: string) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  return `${month}/${day}/${year}`;
}

function formatOptionValue(value?: string) {
  if (!value) return "—";
  return value
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}