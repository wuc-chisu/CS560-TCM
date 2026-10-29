"use client";

import { SectionHeading } from "@/components/ui/section-heading";
import { FormEvent, useState } from "react";
import Link from "next/link";

type Patient = {
  id: string;
  name: string;
  dateOfBirth: string;
  phone: string;
  lastVisit: string | null;
};

const initialPatients: Patient[] = [
  { id: "amy-chen", name: "Amy Chen", dateOfBirth: "1980-03-12", phone: "408-555-1234", lastVisit: null },
  { id: "john-lee", name: "John Lee", dateOfBirth: "1975-08-21", phone: "415-555-5678", lastVisit: null },
];

export default function Page() {
  const [patients, setPatients] = useState(initialPatients);
  const [search, setSearch] = useState("");
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const visiblePatients = patients.filter((patient) =>
    `${patient.name} ${patient.dateOfBirth} ${formatDate(patient.dateOfBirth)} ${patient.phone}`
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );

  function openEditDialog(patient: Patient) {
    setEditingPatient(patient);
    setIsDialogOpen(true);
  }

  function savePatient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const patient: Patient = {
      id: editingPatient?.id ?? crypto.randomUUID(),
      name: String(formData.get("name")).trim(),
      dateOfBirth: String(formData.get("dateOfBirth")),
      phone: String(formData.get("phone")).trim(),
      lastVisit: editingPatient?.lastVisit ?? null,
    };

    setPatients((current) =>
      editingPatient
        ? current.map((item) => (item.id === editingPatient.id ? patient : item))
        : [...current, patient],
    );
    setIsDialogOpen(false);
    setEditingPatient(null);
  }

  return (
    <div>
      <SectionHeading
        eyebrow="MEDICAL RECORDS"
        title="Patient List"
        description="View patient information and recent visit dates."
      />

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block w-full sm:max-w-sm">
          <span className="sr-only">Search patients</span>
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400"
          >
            <path
              fillRule="evenodd"
              d="M8.5 3a5.5 5.5 0 1 0 3.47 9.77l3.63 3.63a.75.75 0 1 0 1.06-1.06l-3.63-3.63A5.5 5.5 0 0 0 8.5 3ZM4.5 8.5a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z"
              clipRule="evenodd"
            />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, date of birth, or phone"
            className="w-full rounded-xl border border-red-900/15 bg-white/90 py-3 pl-10 pr-4 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-red-800 focus:ring-2 focus:ring-red-800/10"
          />
        </label>
        <Link
          href="/admin/medical-records/patient/new"
          className="rounded-full bg-red-800 px-5 py-3 text-sm font-medium text-amber-100 transition hover:bg-red-700"
        >
          Add Patient
        </Link>
      </div>

      <div className="mt-4 overflow-hidden rounded-3xl border border-red-900/10 bg-white/90 shadow-lg shadow-red-950/5">
        <div className="border-b border-red-900/10 px-6 py-4 text-sm text-stone-600">
          {visiblePatients.length} patients
        </div>
        {visiblePatients.length === 0 ? (
          <div className="px-6 py-14 text-center text-sm text-stone-500">No patients match your search.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-red-900/10 text-left text-sm text-stone-700">
              <thead className="bg-[#fff8ef] text-xs text-amber-800">
                <tr>
                  <th scope="col" className="px-6 py-4 font-medium">Patient Name</th>
                  <th scope="col" className="px-6 py-4 font-medium">Date of Birth</th>
                  <th scope="col" className="px-6 py-4 font-medium">Phone</th>
                  <th scope="col" className="px-6 py-4 font-medium">Last Visit</th>
                  <th scope="col" className="px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-900/10">
                {visiblePatients.map((patient) => (
                  <tr key={patient.id}>
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-stone-900">{patient.name}</td>
                    <td className="whitespace-nowrap px-6 py-4">{formatDate(patient.dateOfBirth)}</td>
                    <td className="whitespace-nowrap px-6 py-4">{patient.phone}</td>
                    <td className="whitespace-nowrap px-6 py-4">{patient.lastVisit ?? "—"}</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/medical-records/patient?name=${encodeURIComponent(patient.name)}&dateOfBirth=${encodeURIComponent(patient.dateOfBirth)}&phone=${encodeURIComponent(patient.phone)}`}
                          className="rounded-full border border-red-300 px-3 py-1.5 text-xs font-medium text-red-800 transition hover:bg-red-50"
                        >
                          View
                        </Link>
                        <button
                          type="button"
                          onClick={() => openEditDialog(patient)}
                          className="rounded-full border border-amber-400 px-3 py-1.5 text-xs font-medium text-amber-800 transition hover:bg-amber-50"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isDialogOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsDialogOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="patient-dialog-title"
            className="w-full max-w-md rounded-2xl border border-red-900/10 bg-[#fffdf9] p-6 shadow-2xl"
          >
            <h3 id="patient-dialog-title" className="text-xl font-semibold text-stone-900">
              {editingPatient ? "Edit Patient" : "Add Patient"}
            </h3>
            <form onSubmit={savePatient} className="mt-5 space-y-4">
              <label className="block text-sm font-medium text-stone-700">
                Patient Name
                <input
                  required
                  name="name"
                  defaultValue={editingPatient?.name ?? ""}
                  className="mt-1.5 w-full rounded-lg border border-red-900/15 bg-white px-3 py-2.5 font-normal outline-none focus:border-red-800 focus:ring-2 focus:ring-red-800/10"
                />
              </label>
              <label className="block text-sm font-medium text-stone-700">
                Date of Birth
                <input
                  required
                  type="date"
                  name="dateOfBirth"
                  defaultValue={editingPatient?.dateOfBirth ?? ""}
                  className="mt-1.5 w-full rounded-lg border border-red-900/15 bg-white px-3 py-2.5 font-normal outline-none focus:border-red-800 focus:ring-2 focus:ring-red-800/10"
                />
              </label>
              <label className="block text-sm font-medium text-stone-700">
                Phone
                <input
                  required
                  type="tel"
                  name="phone"
                  defaultValue={editingPatient?.phone ?? ""}
                  className="mt-1.5 w-full rounded-lg border border-red-900/15 bg-white px-3 py-2.5 font-normal outline-none focus:border-red-800 focus:ring-2 focus:ring-red-800/10"
                />
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  className="rounded-full border border-stone-300 px-4 py-2 text-sm text-stone-700 transition hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-red-800 px-4 py-2 text-sm font-medium text-amber-100 transition hover:bg-red-700"
                >
                  Save
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </div>
  );
}

function formatDate(value: string) {
  const [year, month, day] = value.split("-");
  return `${month}/${day}/${year}`;
}
