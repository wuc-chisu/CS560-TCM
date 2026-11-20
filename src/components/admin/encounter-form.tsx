"use client";

import Link from "next/link";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { SectionHeading } from "@/components/ui/section-heading";

type EncounterPatient = {
  id: string;
  name: string;
  dateOfBirth: string;
  phone: string;
  email: string | null;
};

type EncounterFormProps = {
  patient: EncounterPatient;
};

const steps = [
  "Patient & Visit Verification",
  "Subjective — Chief Complaint & HPI",
  "Objective — Current Health Update & Vitals",
  "Objective — Examination & TCM Findings",
  "Assessment — Diagnosis & TCM Pattern Differentiation",
  "Plan — Treatment & Procedure Documentation",
  "Review & Complete",
  "Patient Summary & Recommendations",
] as const;

const inputClassName =
  "mt-1.5 w-full rounded-lg border border-red-900/15 bg-white px-3 py-2.5 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-red-800 focus:ring-2 focus:ring-red-800/10";
const labelClassName = "block text-sm font-medium text-stone-700";
const sectionClassName = "px-5 py-6 sm:px-8 sm:py-7";
const requiredMark = <span aria-hidden="true" className="text-red-800"> *</span>;

const summaryPrompts = [
  "Today’s Visit Summary",
  "Main Symptoms / Diagnosis Summary",
  "Treatment Performed",
  "Diet Recommendations",
  "Foods to Avoid",
  "Lifestyle Recommendations",
  "Sleep Recommendations",
  "Exercise / Movement",
  "Self-Care Instructions",
  "Follow-up Instructions",
];

export function EncounterForm({ patient }: EncounterFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [values, setValues] = useState<Record<string, string>>({
    visitDate: getTodayDate(),
  });
  const [notice, setNotice] = useState("");

  function validateCurrentStep() {
    const section = formRef.current?.querySelector<HTMLElement>(`[data-step="${currentStep}"]`);
    const fields = section?.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      "input, select, textarea",
    );

    if (!fields) return false;

    for (const field of fields) {
      field.setCustomValidity("");
      if (
        field.required &&
        !(field instanceof HTMLInputElement && field.type === "checkbox") &&
        field.value.trim() === ""
      ) {
        field.setCustomValidity("Please complete this required field.");
      }
      if (!field.reportValidity()) return false;
    }

    return true;
  }

  function handleFormChange(event: ChangeEvent<HTMLFormElement>) {
    const target = event.target;
    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLSelectElement ||
      target instanceof HTMLTextAreaElement
    ) {
      target.setCustomValidity("");
    }

    const nextValues: Record<string, string> = {};
    for (const [name, value] of new FormData(event.currentTarget).entries()) {
      if (typeof value === "string") nextValues[name] = value;
    }
    setValues(nextValues);
    setNotice("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validateCurrentStep()) return;

    setNotice("");
    setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
  }

  function printPatientSummary() {
    if (!validateCurrentStep()) return;
    window.print();
  }

  function emailPatientSummary() {
    if (!validateCurrentStep()) return;
    if (!patient.email) {
      setNotice("Add an email address to the patient profile before preparing an email.");
      return;
    }

    const subject = `Your visit summary from He An Clinic`;
    const body = `Hello ${patient.name},\n\n${values.patientSummary}\n\nHe An Clinic`;
    window.location.href = `mailto:${encodeURIComponent(patient.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setNotice("Your email app should open with the summary ready to review and send.");
  }

  const patientSummary = values.patientSummary ?? "";

  return (
    <div>
      <SectionHeading
        eyebrow="MEDICAL RECORDS"
        title="New Encounter"
        description="Document the clinical visit and prepare a separate, patient-friendly after-visit summary."
      />

      <div className="sticky top-0 z-20 -mx-4 mt-5 bg-[#f8f2e8]/95 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <dl className="grid gap-3 rounded-2xl border border-red-900/10 bg-white/95 p-4 shadow-md shadow-red-950/5 sm:grid-cols-2 lg:grid-cols-4">
          <PatientDetail label="Patient Name" value={patient.name} />
          <PatientDetail label="DOB" value={patient.dateOfBirth ? formatDate(patient.dateOfBirth) : "—"} />
          <PatientDetail label="Phone" value={patient.phone || "—"} />
          <PatientDetail label="Patient ID" value={patient.id} breakAll />
        </dl>
      </div>

      <ol aria-label="Encounter steps" className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {steps.map((step, index) => {
          const isCurrent = currentStep === index;
          const isComplete = currentStep > index;

          return (
            <li
              key={step}
              aria-current={isCurrent ? "step" : undefined}
              className="flex items-start gap-2 text-left lg:flex-col lg:items-center lg:text-center"
            >
              <span
                className={[
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                  isCurrent || isComplete
                    ? "bg-red-800 text-amber-100"
                    : "border border-red-900/15 bg-white/80 text-stone-500",
                ].join(" ")}
              >
                {index + 1}
              </span>
              <span className={`text-xs leading-5 sm:text-sm ${isCurrent ? "font-semibold text-red-900" : "text-stone-500"}`}>
                {step}
              </span>
            </li>
          );
        })}
      </ol>

      <form
        ref={formRef}
        noValidate
        onSubmit={handleSubmit}
        onChange={handleFormChange}
        className="mt-6 overflow-hidden rounded-3xl border border-red-900/10 bg-white/90 shadow-lg shadow-red-950/5"
      >
        <p className="px-5 pt-6 text-sm text-stone-500 sm:px-8">
          Fields marked <span className="text-red-800">*</span> are required to continue.
        </p>

        <section hidden={currentStep !== 0} data-step="0" aria-labelledby="encounter-verification" className={sectionClassName}>
          <h3 id="encounter-verification" className="text-lg font-semibold text-red-900">{steps[0]}</h3>
          <p className="mt-2 text-sm text-stone-600">Confirm the patient and document the visit details before starting the clinical note.</p>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label className={labelClassName}>
              Visit Date{requiredMark}
              <input required type="date" name="visitDate" defaultValue={values.visitDate} className={inputClassName} />
            </label>
            <label className={labelClassName}>
              Encounter Type{requiredMark}
              <select required name="encounterType" defaultValue="" className={inputClassName}>
                <option value="">Select encounter type</option>
                <option value="initial">Initial visit</option>
                <option value="follow-up">Follow-up visit</option>
                <option value="consultation">Consultation</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className={`${labelClassName} flex items-start gap-3 sm:col-span-2`}>
              <input required type="checkbox" name="identityVerified" value="yes" className="mt-1 accent-red-800" />
              <span>I verified the patient’s identity and confirmed this is the correct chart.{requiredMark}</span>
            </label>
          </div>
        </section>

        <section hidden={currentStep !== 1} data-step="1" aria-labelledby="encounter-subjective" className={sectionClassName}>
          <h3 id="encounter-subjective" className="text-lg font-semibold text-red-900">{steps[1]}</h3>
          <div className="mt-5 grid gap-5">
            <label className={labelClassName}>
              Chief Complaint{requiredMark}
              <input required name="chiefComplaint" placeholder="Primary reason for today’s visit" className={inputClassName} />
            </label>
            <label className={labelClassName}>
              History of Present Illness (HPI){requiredMark}
              <textarea required name="hpi" rows={6} placeholder="Describe onset, duration, location, character, aggravating or relieving factors, and relevant history." className={inputClassName} />
            </label>
          </div>
        </section>

        <section hidden={currentStep !== 2} data-step="2" aria-labelledby="encounter-health-update" className={sectionClassName}>
          <h3 id="encounter-health-update" className="text-lg font-semibold text-red-900">{steps[2]}</h3>
          <div className="mt-5 grid gap-5">
            <label className={labelClassName}>
              Current Health Update{requiredMark}
              <textarea required name="currentHealthUpdate" rows={4} placeholder="Changes since the last visit, current concerns, medications, or relevant health updates." className={inputClassName} />
            </label>
            <fieldset>
              <legend className="text-sm font-medium text-stone-700">Vitals <span className="font-normal text-stone-500">(optional when unavailable)</span></legend>
              <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <label className={labelClassName}>Blood Pressure (systolic)<input type="number" min="0" name="bloodPressureSystolic" placeholder="mmHg" className={inputClassName} /></label>
                <label className={labelClassName}>Blood Pressure (diastolic)<input type="number" min="0" name="bloodPressureDiastolic" placeholder="mmHg" className={inputClassName} /></label>
                <label className={labelClassName}>Heart Rate<input type="number" min="0" name="heartRate" placeholder="bpm" className={inputClassName} /></label>
                <label className={labelClassName}>Respiratory Rate<input type="number" min="0" name="respiratoryRate" placeholder="breaths/min" className={inputClassName} /></label>
                <label className={labelClassName}>Temperature<input type="number" min="0" step="0.1" name="temperature" placeholder="°F" className={inputClassName} /></label>
                <label className={labelClassName}>Oxygen Saturation<input type="number" min="0" max="100" name="oxygenSaturation" placeholder="%" className={inputClassName} /></label>
                <label className={labelClassName}>Height<input type="text" name="height" placeholder="For example: 5 ft 8 in" className={inputClassName} /></label>
                <label className={labelClassName}>Weight<input type="number" min="0" step="0.1" name="weight" placeholder="lb" className={inputClassName} /></label>
              </div>
            </fieldset>
          </div>
        </section>

        <section hidden={currentStep !== 3} data-step="3" aria-labelledby="encounter-exam" className={sectionClassName}>
          <h3 id="encounter-exam" className="text-lg font-semibold text-red-900">{steps[3]}</h3>
          <div className="mt-5 grid gap-5">
            <label className={labelClassName}>
              Examination Findings{requiredMark}
              <textarea required name="examinationFindings" rows={5} placeholder="Document relevant examination observations and findings." className={inputClassName} />
            </label>
            <label className={labelClassName}>
              TCM Findings{requiredMark}
              <textarea required name="tcmFindings" rows={5} placeholder="Document relevant TCM examination findings." className={inputClassName} />
            </label>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className={labelClassName}>Tongue Observation (optional)<textarea name="tongueObservation" rows={3} className={inputClassName} /></label>
              <label className={labelClassName}>Pulse Findings (optional)<textarea name="pulseFindings" rows={3} className={inputClassName} /></label>
            </div>
          </div>
        </section>

        <section hidden={currentStep !== 4} data-step="4" aria-labelledby="encounter-assessment" className={sectionClassName}>
          <h3 id="encounter-assessment" className="text-lg font-semibold text-red-900">{steps[4]}</h3>
          <div className="mt-5 grid gap-5">
            <label className={labelClassName}>
              Primary Diagnosis{requiredMark}
              <input required name="primaryDiagnosis" placeholder="Diagnosis or clinical impression" className={inputClassName} />
            </label>
            <label className={labelClassName}>
              TCM Pattern Differentiation{requiredMark}
              <textarea required name="tcmPattern" rows={4} placeholder="Document the relevant TCM pattern differentiation." className={inputClassName} />
            </label>
            <label className={labelClassName}>Additional Assessment (optional)<textarea name="additionalAssessment" rows={3} className={inputClassName} /></label>
          </div>
        </section>

        <section hidden={currentStep !== 5} data-step="5" aria-labelledby="encounter-plan" className={sectionClassName}>
          <h3 id="encounter-plan" className="text-lg font-semibold text-red-900">{steps[5]}</h3>
          <div className="mt-5 grid gap-5">
            <label className={labelClassName}>
              Treatment & Procedure Documentation{requiredMark}
              <textarea required name="treatmentProcedure" rows={6} placeholder="Document treatment and procedures performed, or note if none were performed." className={inputClassName} />
            </label>
            <label className={labelClassName}>
              Patient Response / Tolerance (optional)
              <textarea name="patientResponse" rows={4} className={inputClassName} />
            </label>
            <label className={labelClassName}>
              Clinical Plan / Follow-up (optional)
              <textarea name="clinicalPlan" rows={4} className={inputClassName} />
            </label>
          </div>
        </section>

        <section hidden={currentStep !== 6} data-step="6" aria-labelledby="encounter-review" className={sectionClassName}>
          <h3 id="encounter-review" className="text-lg font-semibold text-red-900">{steps[6]}</h3>
          <p className="mt-2 text-sm text-stone-600">Review the provider clinical note below. This clinical documentation is separate from the patient-facing summary in the next step.</p>
          <dl className="mt-5 grid gap-4 rounded-2xl border border-red-900/10 bg-[#fffaf4] p-4 sm:grid-cols-2">
            <ReviewItem label="Visit" value={[formatDate(values.visitDate ?? ""), values.encounterType].filter(Boolean).join(" · ")} />
            <ReviewItem label="Chief Complaint" value={values.chiefComplaint} />
            <ReviewItem label="HPI" value={values.hpi} />
            <ReviewItem label="Current Health Update" value={values.currentHealthUpdate} />
            <ReviewItem label="Vitals" value={formatVitals(values)} />
            <ReviewItem label="Examination Findings" value={values.examinationFindings} />
            <ReviewItem label="TCM Findings" value={values.tcmFindings} />
            <ReviewItem label="Primary Diagnosis" value={values.primaryDiagnosis} />
            <ReviewItem label="TCM Pattern Differentiation" value={values.tcmPattern} />
            <ReviewItem label="Treatment & Procedure" value={values.treatmentProcedure} />
          </dl>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label className={labelClassName}>
              Provider Name{requiredMark}
              <input required name="providerName" autoComplete="name" className={inputClassName} />
            </label>
            <label className={`${labelClassName} flex items-start gap-3 sm:col-span-2`}>
              <input required type="checkbox" name="clinicalNoteReviewed" value="yes" className="mt-1 accent-red-800" />
              <span>I reviewed this clinical note and confirm it is ready to complete.{requiredMark}</span>
            </label>
          </div>
          <p className="mt-5 rounded-xl border border-amber-300/70 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            This encounter is a UI-only draft and will not be saved to the medical record.
          </p>
        </section>

        <section hidden={currentStep !== 7} data-step="7" aria-labelledby="encounter-summary" className={sectionClassName}>
          <h3 id="encounter-summary" className="text-lg font-semibold text-red-900">{steps[7]}</h3>
          <p className="mt-2 text-sm text-stone-600">
            Write one clear, patient-friendly summary. The prompts are guidance only; include what is relevant and leave out anything that does not apply.
          </p>

          <div className="mt-5 rounded-2xl border border-amber-200 bg-[#fffaf4] p-4">
            <h4 className="text-sm font-semibold text-amber-900">Helpful prompts</h4>
            <ul className="mt-3 grid gap-x-6 gap-y-2 text-sm text-stone-700 sm:grid-cols-2">
              {summaryPrompts.map((prompt) => <li key={prompt}>• {prompt}</li>)}
            </ul>
          </div>

          <label className={`${labelClassName} mt-5`}>
            Patient-Friendly After-Visit Summary{requiredMark}
            <textarea
              required
              name="patientSummary"
              value={patientSummary}
              onChange={(event) => {
                setValues((current) => ({ ...current, patientSummary: event.target.value }));
                setNotice("");
              }}
              rows={12}
              placeholder="Write the recommendations and instructions you discussed with this patient in clear, supportive language."
              className={inputClassName}
            />
          </label>

          <p className="mt-4 rounded-xl border border-red-900/10 bg-white px-4 py-3 text-sm text-stone-600">
            This patient-facing summary is separate from the provider’s full clinical SOAP record. Email opens your default email app; review and send the message there.
          </p>

          {notice ? <p role="status" className="mt-4 text-sm text-red-900">{notice}</p> : null}

          <div className="mt-5 flex flex-wrap gap-3 print:hidden">
            <button type="button" onClick={printPatientSummary} className="rounded-full bg-red-800 px-5 py-2.5 text-sm font-medium text-amber-100 transition hover:bg-red-700">
              Generate PDF
            </button>
            <button type="button" onClick={printPatientSummary} className="rounded-full border border-red-300 px-5 py-2.5 text-sm font-medium text-red-800 transition hover:bg-red-50">
              Print
            </button>
            <button type="button" onClick={emailPatientSummary} disabled={!patient.email} className="rounded-full border border-amber-400 px-5 py-2.5 text-sm font-medium text-amber-900 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50">
              Email to Patient
            </button>
            {!patient.email ? <p className="self-center text-sm text-stone-500">A patient email address is not on file.</p> : null}
          </div>
          <p className="mt-3 text-xs text-stone-500 print:hidden">Generate PDF opens the browser print dialog; choose “Save as PDF” to download a PDF copy.</p>
        </section>

        <div className="flex flex-col-reverse gap-3 border-t border-red-900/10 bg-[#fffaf4] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <Link href={`/admin/medical-records/patient?id=${encodeURIComponent(patient.id)}`} className="text-center text-sm font-medium text-red-800 transition hover:text-red-700">
            Exit to Patient Details
          </Link>
          <div className="flex justify-end gap-3">
            {currentStep > 0 ? (
              <button type="button" onClick={() => { setNotice(""); setCurrentStep((step) => step - 1); }} className="rounded-full border border-red-300 px-5 py-2.5 text-sm font-medium text-red-800 transition hover:bg-red-50">
                Back
              </button>
            ) : null}
            {currentStep < steps.length - 1 ? (
              <button type="submit" className="rounded-full bg-red-800 px-5 py-2.5 text-sm font-medium text-amber-100 transition hover:bg-red-700">
                {currentStep === 6 ? "Continue to Patient Summary" : "Next"}
              </button>
            ) : null}
          </div>
        </div>
      </form>

      <section aria-label="Printable patient summary" className="encounter-print-summary">
        <p className="text-sm font-medium uppercase tracking-wide text-amber-800">He An Clinic · After-Visit Summary</p>
        <h1 className="mt-3 text-3xl font-semibold text-stone-900">{patient.name}</h1>
        <p className="mt-2 text-sm text-stone-600">Visit date: {formatDate(values.visitDate ?? "")}</p>
        <div className="mt-8 whitespace-pre-wrap text-base leading-7 text-stone-800">{patientSummary}</div>
        <p className="mt-10 border-t border-stone-300 pt-4 text-sm text-stone-500">Please contact the clinic if you have questions about these instructions.</p>
      </section>
    </div>
  );
}

function PatientDetail({ label, value, breakAll = false }: { label: string; value: string; breakAll?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium text-amber-800">{label}</dt>
      <dd className={`mt-1 text-sm font-medium text-stone-900 ${breakAll ? "break-all" : "truncate"}`}>{value || "—"}</dd>
    </div>
  );
}

function ReviewItem({ label, value }: { label: string; value?: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium text-amber-800">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap break-words text-sm text-stone-800">{value || "—"}</dd>
    </div>
  );
}

function formatVitals(values: Record<string, string>) {
  const parts = [
    values.bloodPressureSystolic || values.bloodPressureDiastolic
      ? `BP ${values.bloodPressureSystolic || "—"}/${values.bloodPressureDiastolic || "—"}`
      : "",
    values.heartRate ? `HR ${values.heartRate} bpm` : "",
    values.respiratoryRate ? `RR ${values.respiratoryRate}/min` : "",
    values.temperature ? `Temp ${values.temperature} °F` : "",
    values.oxygenSaturation ? `O₂ ${values.oxygenSaturation}%` : "",
    values.height ? `Height ${values.height}` : "",
    values.weight ? `Weight ${values.weight} lb` : "",
  ];

  return parts.filter(Boolean).join(" · ") || "Not recorded";
}

function getTodayDate() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${today.getFullYear()}-${month}-${day}`;
}

function formatDate(value: string) {
  if (!value) return "—";
  const [year, month, day] = value.split("-");
  return `${month}/${day}/${year}`;
}
