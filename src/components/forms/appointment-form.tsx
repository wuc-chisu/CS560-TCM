"use client";

import {
  appointmentDoctorOptions,
  appointmentSchema,
  appointmentServiceOptions,
  appointmentTimeOptions,
} from "@/lib/appointment-schema";
import { FormEvent, useMemo, useState } from "react";

type FormState = {
  kind: "idle" | "loading" | "success" | "error";
  message: string;
};

type ConfirmationState = {
  isVisible: boolean;
  title: string;
  message: string;
};

type AppointmentFormProps = {
  doctorOptions?: string[];
  serviceOptions?: string[];
  onClose?: () => void;
};

type AppointmentStep = 1 | 2 | 3 | 4;

type Step1Field = "patientType" | "name" | "phone" | "email" | "gender";
type Step1Errors = Partial<Record<Step1Field, string>>;

type AppointmentFormValues = {
  patientType: "new" | "returning" | "";
  name: string;
  phone: string;
  email: string;
  gender: string;
  insuranceProvider: string;
  insuranceId: string;
  service: string;
  doctor: string;
  preferredDate: string;
  preferredTime: string;
  message: string;
};

const defaultValues: AppointmentFormValues = {
  patientType: "",
  name: "",
  phone: "",
  email: "",
  gender: "",
  insuranceProvider: "",
  insuranceId: "",
  service: "",
  doctor: "",
  preferredDate: "",
  preferredTime: "",
  message: "",
};

const stepTitles: Record<AppointmentStep, string> = {
  1: "Patient Information",
  2: "Select a Service and Practitioner",
  3: "Choose a Date",
  4: "Confirm Appointment",
};

export function AppointmentForm({ doctorOptions, serviceOptions, onClose }: AppointmentFormProps) {
  const [status, setStatus] = useState<FormState>({ kind: "idle", message: "" });
  const [step, setStep] = useState<AppointmentStep>(1);
  const [values, setValues] = useState<AppointmentFormValues>(defaultValues);
  const [step1Errors, setStep1Errors] = useState<Step1Errors>({});
  const [confirmation, setConfirmation] = useState<ConfirmationState>({ isVisible: false, title: "", message: "" });
  const doctorList = doctorOptions?.length ? doctorOptions : [...appointmentDoctorOptions];
  const serviceList = serviceOptions?.length ? serviceOptions : [...appointmentServiceOptions];

  const selectedDuration = values.patientType === "new" ? "60 minutes" : values.patientType === "returning" ? "45 minutes" : "—";
  const stepProgress = useMemo(() => Math.round((step / 4) * 100), [step]);

  function isStep1Field(field: keyof AppointmentFormValues): field is Step1Field {
    return ["patientType", "name", "phone", "email", "gender"].includes(field);
  }

  function getStep1Error(field: Step1Field, nextValues: AppointmentFormValues) {
    switch (field) {
      case "patientType":
        return nextValues.patientType ? undefined : "Select a patient type.";
      case "name":
        return nextValues.name.trim() ? undefined : "Enter your name.";
      case "phone": {
        if (!nextValues.phone.trim()) {
          return "Enter your phone number.";
        }

        return nextValues.phone.replace(/\D/g, "").length === 10 ? undefined : "Enter a 10-digit phone number.";
      }
      case "email": {
        if (!nextValues.email.trim()) {
          return "Enter your email address.";
        }

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextValues.email) ? undefined : "Enter a valid email address.";
      }
      case "gender":
        return nextValues.gender ? undefined : "Select a gender.";
      default:
        return undefined;
    }
  }

  function updateField(field: keyof AppointmentFormValues, value: string) {
    const nextValues = { ...values, [field]: value };
    setValues(nextValues);

    if (step === 1 && isStep1Field(field)) {
      const nextError = getStep1Error(field, nextValues);
      setStep1Errors((current) => {
        if (!nextError) {
          if (!current[field]) {
            return current;
          }

          const nextErrors = { ...current };
          delete nextErrors[field];
          return nextErrors;
        }

        return { ...current, [field]: nextError };
      });
    }
  }

  function validateStepOne() {
    const nextErrors: Step1Errors = {};

    (Object.keys(defaultValues) as Step1Field[]).forEach((field) => {
      const error = getStep1Error(field, values);
      if (error) {
        nextErrors[field] = error;
      }
    });

    setStep1Errors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function getMinDateValue() {
    const today = new Date();
    const year = today.getFullYear();
    const month = `${today.getMonth() + 1}`.padStart(2, "0");
    const day = `${today.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function handleDateChange(event: FormEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const value = input.value;

    if (!value) {
      input.setCustomValidity("");
      return;
    }

    const date = new Date(`${value}T00:00:00`);
    const day = date.getDay();

    if (day === 0 || day === 6) {
      input.setCustomValidity("Appointments are available Monday through Friday only.");
    } else {
      input.setCustomValidity("");
    }

    input.reportValidity();
  }

  function goNext() {
    if (step === 1 && !validateStepOne()) {
      return;
    }

    if (step < 4) {
      setStep((current) => (current + 1) as AppointmentStep);
    }
  }

  function goBack() {
    if (step > 1) {
      setStep((current) => (current - 1) as AppointmentStep);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;

    event.preventDefault();
    setStatus({ kind: "loading", message: "" });

    if (step === 1 && !validateStepOne()) {
      setStep(1);
      setStatus({ kind: "error", message: "Complete the required fields in Step 1 first." });
      return;
    }

    if (step !== 4) {
      setStep(4);
      return;
    }

    const payload = {
      patientType: values.patientType,
      name: values.name,
      phone: values.phone,
      email: values.email,
      service: values.service,
      preferredDate: values.preferredDate,
      preferredTime: values.preferredTime,
      doctor: values.doctor,
      message: values.message,
    };

    const parsed = appointmentSchema.safeParse(payload);

    if (!parsed.success) {
      setStatus({
        kind: "error",
        message: parsed.error.issues[0]?.message || "Please review your appointment details.",
      });
      setStep(4);
      return;
    }

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const result = (await response.json()) as { success?: boolean; message?: string };

      if (!response.ok) {
        throw new Error(result.message || "submit failed");
      }

      setStatus({ kind: "success", message: result.message || "Your appointment request has been submitted. The clinic will contact you during business hours." });
      setConfirmation({
        isVisible: true,
        title: "Appointment Successful",
        message: result.message || "Your appointment request has been submitted. The clinic will contact you during business hours.",
      });
      setStep(4);
    } catch (error) {
      setStatus({
        kind: "error",
        message: error instanceof Error ? error.message : "Unable to submit your request. Please try again later.",
      });
    }
  }

  function handleCloseConfirmation() {
    onClose?.();
    setConfirmation({ isVisible: false, title: "", message: "" });
    setStatus({ kind: "idle", message: "" });
    setStep(1);
    setValues(defaultValues);
    setStep1Errors({});
  }

  if (confirmation.isVisible) {
    return (
      <div className="rounded-2xl border border-red-900/10 bg-white/95 p-5 shadow-lg shadow-red-950/5 sm:p-6">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center sm:p-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-2xl text-white">✓</div>
          <h3 className="mt-4 text-xl font-semibold text-red-900">{confirmation.title}</h3>
          <p className="mt-2 text-sm leading-6 text-stone-700">{confirmation.message}</p>
          <div className="mt-5 rounded-xl border border-stone-200 bg-white/80 p-4 text-left text-sm text-stone-700">
            <p className="font-semibold text-red-900">Appointment Summary</p>
            <div className="mt-2 space-y-1">
              <p>Patient: {values.name || "—"}</p>
              <p>Type: {values.patientType === "new" ? "New patient" : values.patientType === "returning" ? "Returning patient" : "—"}</p>
              <p>Service: {values.service || "—"}</p>
              <p>Practitioner: {values.doctor || "—"}</p>
              <p>Date: {values.preferredDate || "—"}</p>
              <p>Time: {values.preferredTime || "—"}</p>
              <p>Estimated duration: {selectedDuration}</p>
              <p>Additional notes: {values.message || "—"}</p>
            </div>
          </div>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={handleCloseConfirmation}
              className="rounded-md bg-red-800 px-4 py-2 text-sm font-medium text-amber-100 transition hover:bg-red-700"
            >
              Close / Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-red-900/10 bg-white/95 p-4 shadow-lg shadow-red-950/5 sm:p-5">
      <div className="rounded-xl border border-red-900/10 bg-[#fffaf1] p-3 sm:p-4">
        <div className="flex items-center justify-between text-xs font-medium uppercase tracking-[0.2em] text-amber-700">
          <span>Step {step} of 4</span>
          <span>{stepProgress}%</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-stone-200">
          <div className="h-2 rounded-full bg-red-800 transition-all" style={{ width: `${stepProgress}%` }} />
        </div>
        <p className="mt-2 text-sm font-semibold text-red-900">{stepTitles[step]}</p>
      </div>

      {step === 1 ? (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm text-stone-700">
              <span className="mb-1 block font-medium">Patient Type</span>
              <select
                value={values.patientType}
                onChange={(event) => updateField("patientType", event.target.value)}
                className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none ring-red-700/20 transition focus:ring"
              >
                <option value="">Select a patient type</option>
                <option value="new">New patient</option>
                <option value="returning">Returning patient</option>
              </select>
              {step1Errors.patientType ? <p className="mt-1 text-xs text-red-600">{step1Errors.patientType}</p> : null}
            </label>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <p className="font-medium">Estimated Duration</p>
              <p className="mt-1">{selectedDuration}</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm text-stone-700">
              <span className="mb-1 block font-medium">Name</span>
              <input
                minLength={2}
                maxLength={50}
                value={values.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Name"
                className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none ring-red-700/20 transition focus:ring"
              />
              {step1Errors.name ? <p className="mt-1 text-xs text-red-600">{step1Errors.name}</p> : null}
            </label>
            <label className="text-sm text-stone-700">
              <span className="mb-1 block font-medium">Phone Number</span>
              <input
                minLength={8}
                maxLength={20}
                value={values.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                placeholder="Phone Number"
                className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none ring-red-700/20 transition focus:ring"
              />
              {step1Errors.phone ? <p className="mt-1 text-xs text-red-600">{step1Errors.phone}</p> : null}
            </label>
          </div>
          <label className="block text-sm text-stone-700">
            <span className="mb-1 block font-medium">Email</span>
            <input
              type="email"
              value={values.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="Email"
              className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none ring-red-700/20 transition focus:ring"
            />
            {step1Errors.email ? <p className="mt-1 text-xs text-red-600">{step1Errors.email}</p> : null}
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm text-stone-700">
              <span className="mb-1 block font-medium">Gender</span>
              <select
                value={values.gender}
                onChange={(event) => updateField("gender", event.target.value)}
                className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none ring-red-700/20 transition focus:ring"
              >
                <option value="">Select a gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {step1Errors.gender ? <p className="mt-1 text-xs text-red-600">{step1Errors.gender}</p> : null}
            </label>
            <label className="text-sm text-stone-700">
              <span className="mb-1 block font-medium">Insurance Provider</span>
              <input
                value={values.insuranceProvider}
                onChange={(event) => updateField("insuranceProvider", event.target.value)}
                placeholder="For example: health or private insurance"
                className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none ring-red-700/20 transition focus:ring"
              />
            </label>
          </div>
          <label className="block text-sm text-stone-700">
            <span className="mb-1 block font-medium">Insurance ID</span>
            <input
              value={values.insuranceId}
              onChange={(event) => updateField("insuranceId", event.target.value)}
              placeholder="Insurance ID"
              className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none ring-red-700/20 transition focus:ring"
            />
          </label>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-3">
          <label className="block text-sm text-stone-700">
            <span className="mb-1 block font-medium">Service</span>
            <select
              required
              value={values.service}
              onChange={(event) => updateField("service", event.target.value)}
              className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none ring-red-700/20 transition focus:ring"
            >
              <option value="">Select a service</option>
              {serviceList.map((service) => (
                <option key={service} value={service}>
                  {service}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm text-stone-700">
            <span className="mb-1 block font-medium">Practitioner</span>
            <select
              required
              value={values.doctor}
              onChange={(event) => updateField("doctor", event.target.value)}
              className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none ring-red-700/20 transition focus:ring"
            >
              <option value="">Select a practitioner</option>
              {doctorList.map((doctor) => (
                <option key={doctor} value={doctor}>
                  {doctor}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm text-stone-700">
            <span className="mb-1 block font-medium">Additional Notes</span>
            <textarea
              rows={4}
              value={values.message}
              onChange={(event) => updateField("message", event.target.value)}
              placeholder="Share any additional information"
              className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none ring-red-700/20 transition focus:ring"
            />
          </label>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-3">
          <label className="block text-sm text-stone-700">
            <span className="mb-1 block font-medium">Appointment Date</span>
            <input
              required
              type="date"
              min={getMinDateValue()}
              value={values.preferredDate}
              onChange={(event) => {
                updateField("preferredDate", event.target.value);
                handleDateChange(event as unknown as FormEvent<HTMLInputElement>);
              }}
              className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none ring-red-700/20 transition focus:ring"
            />
          </label>
          <label className="block text-sm text-stone-700">
            <span className="mb-1 block font-medium">Appointment Time</span>
            <select
              required
              value={values.preferredTime}
              onChange={(event) => updateField("preferredTime", event.target.value)}
              className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none ring-red-700/20 transition focus:ring"
            >
              <option value="">Select a time (9:00 AM–5:00 PM)</option>
              {appointmentTimeOptions.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </label>
          <p className="text-[11px] leading-5 text-stone-500">Appointments are available Monday through Friday, 9:00 AM–5:00 PM.</p>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="space-y-3">
          <div className="rounded-lg border border-stone-200 bg-[#fffaf1] p-3 text-sm text-stone-700">
            <p className="font-semibold text-red-900">Appointment Confirmation</p>
            <p className="mt-1 text-xs text-stone-500">Review your information before submitting your appointment request.</p>
            <div className="mt-3 space-y-1">
              <p>Patient: {values.name || "—"}</p>
              <p>Type: {values.patientType === "new" ? "New patient" : values.patientType === "returning" ? "Returning patient" : "—"}</p>
              <p>Phone: {values.phone || "—"}</p>
              <p>Email：{values.email || "—"}</p>
              <p>Service: {values.service || "—"}</p>
              <p>Practitioner: {values.doctor || "—"}</p>
              <p>Date: {values.preferredDate || "—"}</p>
              <p>Time: {values.preferredTime || "—"}</p>
              <p>Insurance Provider: {values.insuranceProvider || "—"}</p>
              <p>Insurance ID: {values.insuranceId || "—"}</p>
              <p>Additional Notes: {values.message || "—"}</p>
              <p>Estimated Duration: {selectedDuration}</p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={goBack}
          disabled={step === 1}
          className="rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Previous
        </button>
        {step < 4 ? (
          <button
            type="button"
            onClick={goNext}
            className="rounded-md bg-red-800 px-4 py-2 text-sm font-medium text-amber-100 transition hover:bg-red-700"
          >
            Next
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={goBack}
              className="rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
            >
              Previous
            </button>
            <button
              type="submit"
              disabled={status.kind === "loading"}
              className="rounded-md bg-red-800 px-4 py-2 text-sm font-medium text-amber-100 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {status.kind === "loading" ? "Submitting..." : "Confirm & Submit"}
            </button>
          </div>
        )}
      </div>

      {status.kind === "success" ? <p className="text-xs text-emerald-700" aria-live="polite">{status.message}</p> : null}
      {status.kind === "error" ? <p className="text-xs text-red-700" aria-live="polite">{status.message}</p> : null}
    </form>
  );
}
