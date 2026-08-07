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
  1: "病人資訊",
  2: "選擇治療與醫師",
  3: "選擇日期",
  4: "確認時段",
};

export function AppointmentForm({ doctorOptions, serviceOptions, onClose }: AppointmentFormProps) {
  const [status, setStatus] = useState<FormState>({ kind: "idle", message: "" });
  const [step, setStep] = useState<AppointmentStep>(1);
  const [values, setValues] = useState<AppointmentFormValues>(defaultValues);
  const [step1Errors, setStep1Errors] = useState<Step1Errors>({});
  const [confirmation, setConfirmation] = useState<ConfirmationState>({ isVisible: false, title: "", message: "" });
  const doctorList = doctorOptions?.length ? doctorOptions : [...appointmentDoctorOptions];
  const serviceList = serviceOptions?.length ? serviceOptions : [...appointmentServiceOptions];

  const selectedDuration = values.patientType === "new" ? "60 分鐘" : values.patientType === "returning" ? "45 分鐘" : "—";
  const stepProgress = useMemo(() => Math.round((step / 4) * 100), [step]);

  function isStep1Field(field: keyof AppointmentFormValues): field is Step1Field {
    return ["patientType", "name", "phone", "email", "gender"].includes(field);
  }

  function getStep1Error(field: Step1Field, nextValues: AppointmentFormValues) {
    switch (field) {
      case "patientType":
        return nextValues.patientType ? undefined : "請選擇病人類型。";
      case "name":
        return nextValues.name.trim() ? undefined : "請輸入姓名。";
      case "phone": {
        if (!nextValues.phone.trim()) {
          return "請輸入手機號碼。";
        }

        return nextValues.phone.replace(/\D/g, "").length === 10 ? undefined : "請輸入 10 位數手機號碼。";
      }
      case "email": {
        if (!nextValues.email.trim()) {
          return "請輸入 Email。";
        }

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextValues.email) ? undefined : "請輸入有效的 Email。";
      }
      case "gender":
        return nextValues.gender ? undefined : "請選擇性別。";
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
      input.setCustomValidity("預約日期僅限週一至週五");
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
      setStatus({ kind: "error", message: "請先完成步驟一的必填欄位。" });
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
        message: parsed.error.issues[0]?.message || "請重新確認預約資料。",
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

      setStatus({ kind: "success", message: result.message || "已送出預約，診所將於營業時間與您聯繫。" });
      setConfirmation({
        isVisible: true,
        title: "Appointment Successful",
        message: result.message || "已送出預約，診所將於營業時間與您聯繫。",
      });
      setStep(4);
    } catch (error) {
      setStatus({
        kind: "error",
        message: error instanceof Error ? error.message : "送出失敗，請稍後再試。",
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
              <p>病人：{values.name || "—"}</p>
              <p>類型：{values.patientType === "new" ? "新病人" : values.patientType === "returning" ? "回診病人" : "—"}</p>
              <p>診療項目：{values.service || "—"}</p>
              <p>醫生：{values.doctor || "—"}</p>
              <p>日期：{values.preferredDate || "—"}</p>
              <p>時間：{values.preferredTime || "—"}</p>
              <p>預估時長：{selectedDuration}</p>
              <p>補充症狀與需求：{values.message || "—"}</p>
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
          <span>步驟 {step}/4</span>
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
              <span className="mb-1 block font-medium">病人類型</span>
              <select
                value={values.patientType}
                onChange={(event) => updateField("patientType", event.target.value)}
                className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none ring-red-700/20 transition focus:ring"
              >
                <option value="">選擇病人類型</option>
                <option value="new">新病人</option>
                <option value="returning">回診病人</option>
              </select>
              {step1Errors.patientType ? <p className="mt-1 text-xs text-red-600">{step1Errors.patientType}</p> : null}
            </label>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <p className="font-medium">預估時長</p>
              <p className="mt-1">{selectedDuration}</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm text-stone-700">
              <span className="mb-1 block font-medium">姓名</span>
              <input
                minLength={2}
                maxLength={50}
                value={values.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="姓名"
                className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none ring-red-700/20 transition focus:ring"
              />
              {step1Errors.name ? <p className="mt-1 text-xs text-red-600">{step1Errors.name}</p> : null}
            </label>
            <label className="text-sm text-stone-700">
              <span className="mb-1 block font-medium">手機號碼</span>
              <input
                minLength={8}
                maxLength={20}
                value={values.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                placeholder="手機號碼"
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
              <span className="mb-1 block font-medium">性別</span>
              <select
                value={values.gender}
                onChange={(event) => updateField("gender", event.target.value)}
                className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none ring-red-700/20 transition focus:ring"
              >
                <option value="">選擇性別</option>
                <option value="male">男性</option>
                <option value="female">女性</option>
                <option value="other">其他</option>
              </select>
              {step1Errors.gender ? <p className="mt-1 text-xs text-red-600">{step1Errors.gender}</p> : null}
            </label>
            <label className="text-sm text-stone-700">
              <span className="mb-1 block font-medium">保險提供者</span>
              <input
                value={values.insuranceProvider}
                onChange={(event) => updateField("insuranceProvider", event.target.value)}
                placeholder="例如：健保、商保"
                className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none ring-red-700/20 transition focus:ring"
              />
            </label>
          </div>
          <label className="block text-sm text-stone-700">
            <span className="mb-1 block font-medium">保險 ID</span>
            <input
              value={values.insuranceId}
              onChange={(event) => updateField("insuranceId", event.target.value)}
              placeholder="保險 ID"
              className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none ring-red-700/20 transition focus:ring"
            />
          </label>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-3">
          <label className="block text-sm text-stone-700">
            <span className="mb-1 block font-medium">選擇診療項目</span>
            <select
              required
              value={values.service}
              onChange={(event) => updateField("service", event.target.value)}
              className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none ring-red-700/20 transition focus:ring"
            >
              <option value="">選擇診療項目</option>
              {serviceList.map((service) => (
                <option key={service} value={service}>
                  {service}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm text-stone-700">
            <span className="mb-1 block font-medium">選擇醫生</span>
            <select
              required
              value={values.doctor}
              onChange={(event) => updateField("doctor", event.target.value)}
              className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none ring-red-700/20 transition focus:ring"
            >
              <option value="">選擇醫生</option>
              {doctorList.map((doctor) => (
                <option key={doctor} value={doctor}>
                  {doctor}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm text-stone-700">
            <span className="mb-1 block font-medium">補充症狀與需求</span>
            <textarea
              rows={4}
              value={values.message}
              onChange={(event) => updateField("message", event.target.value)}
              placeholder="補充症狀與需求"
              className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none ring-red-700/20 transition focus:ring"
            />
          </label>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-3">
          <label className="block text-sm text-stone-700">
            <span className="mb-1 block font-medium">選擇預約日期</span>
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
            <span className="mb-1 block font-medium">選擇時間</span>
            <select
              required
              value={values.preferredTime}
              onChange={(event) => updateField("preferredTime", event.target.value)}
              className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none ring-red-700/20 transition focus:ring"
            >
              <option value="">選擇時間（09:00-17:00）</option>
              {appointmentTimeOptions.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </label>
          <p className="text-[11px] leading-5 text-stone-500">預約日期僅限週一至週五，時段開放 09:00 至 17:00。</p>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="space-y-3">
          <div className="rounded-lg border border-stone-200 bg-[#fffaf1] p-3 text-sm text-stone-700">
            <p className="font-semibold text-red-900">Appointment Confirmation</p>
            <p className="mt-1 text-xs text-stone-500">請確認以下資訊後提交預約。</p>
            <div className="mt-3 space-y-1">
              <p>病人：{values.name || "—"}</p>
              <p>類型：{values.patientType === "new" ? "新病人" : values.patientType === "returning" ? "回診病人" : "—"}</p>
              <p>電話：{values.phone || "—"}</p>
              <p>Email：{values.email || "—"}</p>
              <p>診療項目：{values.service || "—"}</p>
              <p>醫生：{values.doctor || "—"}</p>
              <p>日期：{values.preferredDate || "—"}</p>
              <p>時間：{values.preferredTime || "—"}</p>
              <p>保險：{values.insuranceProvider || "—"}</p>
              <p>保險 ID：{values.insuranceId || "—"}</p>
              <p>補充症狀與需求：{values.message || "—"}</p>
              <p>預估時長：{selectedDuration}</p>
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
          上一步
        </button>
        {step < 4 ? (
          <button
            type="button"
            onClick={goNext}
            className="rounded-md bg-red-800 px-4 py-2 text-sm font-medium text-amber-100 transition hover:bg-red-700"
          >
            下一步
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={goBack}
              className="rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
            >
              上一步
            </button>
            <button
              type="submit"
              disabled={status.kind === "loading"}
              className="rounded-md bg-red-800 px-4 py-2 text-sm font-medium text-amber-100 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {status.kind === "loading" ? "送出中..." : "Confirm & Submit"}
            </button>
          </div>
        )}
      </div>

      {status.kind === "success" ? <p className="text-xs text-emerald-700" aria-live="polite">{status.message}</p> : null}
      {status.kind === "error" ? <p className="text-xs text-red-700" aria-live="polite">{status.message}</p> : null}
    </form>
  );
}
