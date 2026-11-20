"use client";

import { SectionHeading } from "@/components/ui/section-heading";
import { savePatientIntake } from "@/app/admin/medical-records/patient/new/actions";
import { usStateAbbreviations } from "@/lib/us-states";
import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";

const inputClassName =
  "mt-1.5 w-full rounded-lg border border-red-900/15 bg-white px-3 py-2.5 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-red-800 focus:ring-2 focus:ring-red-800/10";

const labelClassName = "block text-sm font-medium text-stone-700";

const steps = [
  "Patient Information",
  "Contact Information",
  "Emergency Contact",
  "Insurance Information",
  "Basic Medical Information",
] as const;

export default function NewPatientPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [insuranceUsage, setInsuranceUsage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  function validateCurrentStep() {
    const section = formRef.current?.querySelector<HTMLElement>(`[data-step="${currentStep}"]`);
    const fields = section?.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      "input, select, textarea",
    );

    if (!fields) return false;

    for (const field of fields) {
      if (!field.reportValidity()) return false;
    }

    return true;
  }

  function continueToNextStep() {
    if (!validateCurrentStep()) return;

    setSaveError("");
    setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validateCurrentStep()) return;

    if (currentStep < steps.length - 1) {
      setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
    }
  }

  async function savePatient() {
    if (currentStep !== steps.length - 1 || !validateCurrentStep()) return;
    const form = formRef.current;
    if (!form) return;

    setSaveError("");
    setIsSaving(true);
    try {
      const result = await savePatientIntake(new FormData(form));
      setSaveError(result.error);
      setIsSaving(false);
    } catch (error) {
      setIsSaving(false);
      throw error;
    }
  }

  return (
    <div>
      <SectionHeading
        eyebrow="MEDICAL RECORDS"
        title="New Patient Intake"
        description="Complete the new patient intake form one step at a time."
      />

      <ol aria-label="Form steps" className="mt-8 grid grid-cols-5 gap-2">
        {steps.map((step, index) => {
          const isCurrent = currentStep === index;
          const isComplete = currentStep > index;

          return (
            <li
              key={step}
              aria-current={isCurrent ? "step" : undefined}
              className="flex flex-col items-center gap-2 text-center"
            >
              <span
                className={[
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
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
        onChange={() => setSaveError("")}
        className="mt-6 overflow-hidden rounded-3xl border border-red-900/10 bg-white/90 shadow-lg shadow-red-950/5"
      >
        <p className="px-5 pt-6 text-sm text-stone-500 sm:px-8">
          Fields marked <span className="text-red-800">*</span> are required.
        </p>

        <section hidden={currentStep !== 0} data-step="0" aria-labelledby="patient-information" className="px-5 py-6 sm:px-8 sm:py-7">
          <h3 id="patient-information" className="text-lg font-semibold text-red-900">Patient Information</h3>
          <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <label className={labelClassName}>
              First Name<span aria-hidden="true" className="text-red-800"> *</span>
              <input required name="firstName" autoComplete="given-name" className={inputClassName} />
            </label>
            <label className={labelClassName}>
              Middle Name (optional)
              <input name="middleName" autoComplete="additional-name" className={inputClassName} />
            </label>
            <label className={labelClassName}>
              Last Name<span aria-hidden="true" className="text-red-800"> *</span>
              <input required name="lastName" autoComplete="family-name" className={inputClassName} />
            </label>
            <label className={labelClassName}>
              Preferred Name (optional)
              <input name="preferredName" autoComplete="nickname" className={inputClassName} />
            </label>
            <label className={labelClassName}>
              Date of Birth<span aria-hidden="true" className="text-red-800"> *</span>
              <input required type="date" name="dateOfBirth" autoComplete="bday" className={inputClassName} />
            </label>
            <label className={labelClassName}>
              Gender / Sex<span aria-hidden="true" className="text-red-800"> *</span>
              <select required name="gender" defaultValue="" className={inputClassName}>
                <option value="">Select an option</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
                <option value="undisclosed">Prefer not to say</option>
              </select>
            </label>
            <label className={labelClassName}>
              Preferred Language (optional)
              <input name="preferredLanguage" className={inputClassName} />
            </label>
            <label className={labelClassName}>
              Marital Status (optional)
              <select name="maritalStatus" defaultValue="" className={inputClassName}>
                <option value="">Select an option</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="partnered">Partnered</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
                <option value="undisclosed">Prefer not to say</option>
              </select>
            </label>
            <label className={labelClassName}>
              Occupation (optional)
              <input name="occupation" autoComplete="organization-title" className={inputClassName} />
            </label>
          </div>
        </section>

        <section hidden={currentStep !== 1} data-step="1" aria-labelledby="contact-information" className="px-5 py-6 sm:px-8 sm:py-7">
          <h3 id="contact-information" className="text-lg font-semibold text-red-900">Contact Information</h3>
          <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <label className={labelClassName}>
              Phone Number<span aria-hidden="true" className="text-red-800"> *</span>
              <PhoneInput required name="phone" autoComplete="tel" />
            </label>
            <label className={labelClassName}>
              Email (optional)
              <input
                type="email"
                name="email"
                autoComplete="email"
                inputMode="email"
                pattern="[^@\s]+@[^@\s.]+(\.[^@\s.]+)+"
                title="Enter a valid email address, such as name@example.com."
                className={inputClassName}
              />
            </label>
            <label className={labelClassName}>
              Street Address<span aria-hidden="true" className="text-red-800"> *</span>
              <input required name="address" autoComplete="address-line1" className={inputClassName} />
            </label>
            <label className={labelClassName}>
              Address Line 2 (optional)
              <input name="addressLine2" autoComplete="address-line2" className={inputClassName} />
            </label>
            <label className={labelClassName}>
              City<span aria-hidden="true" className="text-red-800"> *</span>
              <input required name="city" autoComplete="address-level2" className={inputClassName} />
            </label>
            <label className={labelClassName}>
              State<span aria-hidden="true" className="text-red-800"> *</span>
              <select required name="state" autoComplete="address-level1" defaultValue="" className={inputClassName}>
                <option value="">Select a state</option>
                {usStateAbbreviations.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </label>
            <label className={labelClassName}>
              ZIP Code<span aria-hidden="true" className="text-red-800"> *</span>
              <input required name="zipCode" autoComplete="postal-code" inputMode="numeric" className={inputClassName} />
            </label>
            <label className={labelClassName}>
              Preferred Contact Method (optional)
              <select name="preferredContactMethod" defaultValue="" className={inputClassName}>
                <option value="">Select an option</option>
                <option value="phone">Phone</option>
                <option value="email">Email</option>
                <option value="text">Text message</option>
              </select>
            </label>
          </div>
        </section>

        <section hidden={currentStep !== 2} data-step="2" aria-labelledby="emergency-contact" className="px-5 py-6 sm:px-8 sm:py-7">
          <h3 id="emergency-contact" className="text-lg font-semibold text-red-900">Emergency Contact</h3>
          <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <label className={labelClassName}>
              First Name<span aria-hidden="true" className="text-red-800"> *</span>
              <input required name="emergencyFirstName" autoComplete="given-name" className={inputClassName} />
            </label>
            <label className={labelClassName}>
              Last Name<span aria-hidden="true" className="text-red-800"> *</span>
              <input required name="emergencyLastName" autoComplete="family-name" className={inputClassName} />
            </label>
            <label className={labelClassName}>
              Relationship<span aria-hidden="true" className="text-red-800"> *</span>
              <input required name="emergencyRelationship" autoComplete="off" placeholder="For example: spouse, child" className={inputClassName} />
            </label>
            <label className={labelClassName}>
              Phone Number<span aria-hidden="true" className="text-red-800"> *</span>
              <PhoneInput required name="emergencyPhone" autoComplete="tel" />
            </label>
            <label className={labelClassName}>
              Email (optional)
              <input
                type="email"
                name="emergencyEmail"
                autoComplete="email"
                inputMode="email"
                pattern="[^@\s]+@[^@\s.]+(\.[^@\s.]+)+"
                title="Enter a valid email address, such as name@example.com."
                className={inputClassName}
              />
            </label>
          </div>
        </section>

        <section hidden={currentStep !== 3} data-step="3" aria-labelledby="insurance-information" className="px-5 py-6 sm:px-8 sm:py-7">
          <h3 id="insurance-information" className="text-lg font-semibold text-red-900">Insurance Information</h3>
          <fieldset className="mt-5">
            <legend className={labelClassName}>
              Will the patient be using insurance?<span aria-hidden="true" className="text-red-800"> *</span>
            </legend>
            <div role="radiogroup" aria-label="Will the patient be using insurance?" className="mt-2 inline-flex rounded-full border border-red-900/15 bg-white p-1">
              {(["yes", "no"] as const).map((value) => (
                <label
                  key={value}
                  className={[
                    "cursor-pointer rounded-full px-6 py-2 text-sm font-medium transition",
                    insuranceUsage === value
                      ? "bg-red-800 text-amber-100"
                      : "text-stone-700 hover:bg-red-50",
                  ].join(" ")}
                >
                  <input
                    required
                    type="radio"
                    name="willUseInsurance"
                    value={value}
                    checked={insuranceUsage === value}
                    onChange={() => setInsuranceUsage(value)}
                    className="sr-only"
                  />
                  {value === "yes" ? "Yes" : "No"}
                </label>
              ))}
            </div>
          </fieldset>

          <div hidden={insuranceUsage !== "yes"} className="mt-5">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
              <label className={labelClassName}>
                Insurance Company<span aria-hidden="true" className="text-red-800"> *</span>
                <input required disabled={insuranceUsage !== "yes"} name="insuranceProvider" autoComplete="off" className={inputClassName} />
              </label>
              <label className={labelClassName}>
                Member ID<span aria-hidden="true" className="text-red-800"> *</span>
                <input required disabled={insuranceUsage !== "yes"} name="insuranceMemberId" autoComplete="off" className={inputClassName} />
              </label>
              <label className={labelClassName}>
                Group Number (optional)
                <input disabled={insuranceUsage !== "yes"} name="insuranceGroupNumber" autoComplete="off" className={inputClassName} />
              </label>
              <label className={labelClassName}>
                Policy Holder Name<span aria-hidden="true" className="text-red-800"> *</span>
                <input required disabled={insuranceUsage !== "yes"} name="policyholderName" autoComplete="off" className={inputClassName} />
              </label>
              <label className={labelClassName}>
                Relationship to Patient<span aria-hidden="true" className="text-red-800"> *</span>
                <input required disabled={insuranceUsage !== "yes"} name="policyholderRelationship" autoComplete="off" className={inputClassName} />
              </label>
              <label className={labelClassName}>
                Policy Holder Date of Birth (optional)
                <input disabled={insuranceUsage !== "yes"} type="date" name="policyholderDateOfBirth" autoComplete="off" className={inputClassName} />
              </label>
              <label className={labelClassName}>
                Insurance Effective Date (optional)
                <input disabled={insuranceUsage !== "yes"} type="date" name="insuranceEffectiveDate" autoComplete="off" className={inputClassName} />
              </label>
            </div>
          </div>
        </section>

        <section hidden={currentStep !== 4} data-step="4" aria-labelledby="basic-medical-information" className="px-5 py-6 sm:px-8 sm:py-7">
          <h3 id="basic-medical-information" className="text-lg font-semibold text-red-900">Basic Medical Information</h3>
          <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <label className={`${labelClassName} sm:col-span-2`}>
              Allergies (optional)
              <textarea name="allergies" rows={3} className={inputClassName} />
            </label>
            <label className={`${labelClassName} sm:col-span-2`}>
              Current Medications and Supplements (optional)
              <textarea name="currentMedications" rows={3} className={inputClassName} />
            </label>
            <label className={`${labelClassName} sm:col-span-2`}>
              Major Medical Conditions (optional)
              <textarea name="majorMedicalConditions" rows={3} className={inputClassName} />
            </label>
            <label className={`${labelClassName} sm:col-span-2`}>
              Previous Surgeries or Hospitalizations (optional)
              <textarea name="previousSurgeriesOrHospitalizations" rows={3} className={inputClassName} />
            </label>
            <label className={labelClassName}>
              Pregnancy Status (if applicable, optional)
              <select name="pregnancyStatus" defaultValue="" className={inputClassName}>
                <option value="">Select an option</option>
                <option value="not-applicable">Not applicable</option>
                <option value="pregnant">Pregnant</option>
                <option value="not-pregnant">Not pregnant</option>
                <option value="unsure">Unsure</option>
                <option value="undisclosed">Prefer not to say</option>
              </select>
            </label>
            <label className={labelClassName}>
              Primary Care Physician (optional)
              <input name="primaryCarePhysician" autoComplete="off" className={inputClassName} />
            </label>
            <label className={labelClassName}>
              Primary Care Physician Phone (optional)
              <PhoneInput name="primaryCarePhysicianPhone" autoComplete="tel" />
            </label>
            <label className={labelClassName}>
              Previous Acupuncture Experience (optional)
              <select name="previousAcupunctureExperience" defaultValue="" className={inputClassName}>
                <option value="">Select an option</option>
                <option value="none">None</option>
                <option value="some">Some experience</option>
                <option value="regular">Regularly</option>
                <option value="unsure">Unsure</option>
              </select>
            </label>
          </div>
        </section>

        <div className="flex flex-col-reverse gap-3 border-t border-red-900/10 bg-[#fff8ef]/70 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div aria-live="polite" role="status" className="text-sm text-amber-800">
            {saveError ? <span role="alert" className="text-red-700">{saveError}</span> : null}
          </div>
          <div className="flex justify-end gap-3">
            <Link
              href="/admin/medical-records"
              className="rounded-full border border-stone-300 px-5 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-white"
            >
              Cancel
            </Link>
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={() => {
                  setSaveError("");
                  setCurrentStep((step) => Math.max(step - 1, 0));
                }}
                className="rounded-full border border-stone-300 px-5 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-white"
              >
                Back
              </button>
            ) : null}
            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={continueToNextStep}
                className="rounded-full bg-red-800 px-5 py-2.5 text-sm font-medium text-amber-100 transition hover:bg-red-700"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={savePatient}
                disabled={isSaving}
                className="rounded-full bg-red-800 px-5 py-2.5 text-sm font-medium text-amber-100 transition hover:bg-red-700"
              >
                {isSaving ? "Saving..." : "Save Patient"}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

type PhoneInputProps = {
  name: string;
  required?: boolean;
  autoComplete?: string;
};

function PhoneInput({ name, required = false, autoComplete }: PhoneInputProps) {
  const [value, setValue] = useState("");

  function formatPhoneNumber(input: string) {
    const digits = input.replace(/\D/g, "").slice(0, 10);
    if (digits.length > 6) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    if (digits.length > 3) {
      return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    }
    return digits;
  }

  return (
    <input
      required={required}
      type="tel"
      name={name}
      autoComplete={autoComplete}
      inputMode="tel"
      maxLength={12}
      pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
      title="Enter a 10-digit phone number in the format 555-123-4567."
      placeholder="555-123-4567"
      value={value}
      onChange={(event) => setValue(formatPhoneNumber(event.target.value))}
      className={inputClassName}
    />
  );
}
