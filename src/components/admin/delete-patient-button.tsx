"use client";

import { deletePatientRecord } from "@/app/admin/medical-records/patient/delete-actions";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { useState } from "react";

type DeletePatientButtonProps = {
  patientId: string;
  patientName: string;
  onDeleted?: () => void;
};

export function DeletePatientButton({
  patientId,
  patientName,
  onDeleted,
}: DeletePatientButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  async function confirmDelete() {
    setIsDeleting(true);
    setError("");

    try {
      const result = await deletePatientRecord(patientId);
      if (!result.success) {
        setError(result.error);
        return;
      }

      setIsOpen(false);
      if (onDeleted) {
        onDeleted();
      } else {
        router.push("/admin/medical-records");
      }
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError("");
          setIsOpen(true);
        }}
        className="rounded-full border border-red-300 px-4 py-2 text-sm font-medium text-red-800 transition hover:bg-red-50"
      >
        Delete Patient
      </button>

      {isOpen ? createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isDeleting) setIsOpen(false);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape" && !isDeleting) setIsOpen(false);
          }}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-patient-title"
            aria-describedby="delete-patient-description"
            className="w-full min-w-0 max-w-lg whitespace-normal rounded-2xl border-2 border-red-700 bg-white p-6 shadow-2xl"
          >
            <div className="flex min-w-0 items-start gap-4">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                className="mt-0.5 h-10 w-10 shrink-0 text-red-700"
              >
                <path
                  d="M12 3.75 2.92 19.5a1.5 1.5 0 0 0 1.3 2.25h15.56a1.5 1.5 0 0 0 1.3-2.25L12 3.75Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <path d="M12 9v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="17.25" r="1" fill="currentColor" />
              </svg>
              <div className="min-w-0 flex-1">
                <h2 id="delete-patient-title" className="whitespace-normal text-xl font-bold text-red-800">
                  Delete patient record?
                </h2>
                <p id="delete-patient-description" className="mt-2 whitespace-normal break-words text-sm leading-6 text-stone-700 [overflow-wrap:anywhere]">
                  You are about to permanently delete <strong>{patientName}</strong> and their intake information.
                  This action cannot be undone. Associated appointments will remain, but will no longer be linked to this patient.
                </p>
              </div>
            </div>

            {error ? (
              <p role="alert" className="mt-4 min-w-0 break-words [overflow-wrap:anywhere] rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
                {error}
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap justify-end gap-3 whitespace-normal">
              <button
                type="button"
                autoFocus
                disabled={isDeleting}
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDelete}
                className="rounded-full bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? "Deleting..." : "Delete Patient"}
              </button>
            </div>
          </section>
        </div>,
        document.body,
      ) : null}
    </>
  );
}
