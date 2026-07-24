"use client";

import {
  appointmentDoctorOptions,
  appointmentSchema,
  appointmentServiceOptions,
  appointmentTimeOptions,
} from "@/lib/appointment-schema";
import { FormEvent, useState } from "react";

type FormState = {
  kind: "idle" | "loading" | "success" | "error";
  message: string;
};

type AppointmentFormProps = {
  doctorOptions?: string[];
  serviceOptions?: string[];
};

export function AppointmentForm({ doctorOptions, serviceOptions }: AppointmentFormProps) {
  const [status, setStatus] = useState<FormState>({ kind: "idle", message: "" });
  const doctorList = doctorOptions?.length ? doctorOptions : [...appointmentDoctorOptions];
  const serviceList = serviceOptions?.length ? serviceOptions : [...appointmentServiceOptions];

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;

    event.preventDefault();
    setStatus({ kind: "loading", message: "" });

    const formData = new FormData(form);

    const payload = {
      name: String(formData.get("name") || ""),
      phone: String(formData.get("phone") || ""),
      email: String(formData.get("email") || ""),
      service: String(formData.get("service") || ""),
      preferredDate: String(formData.get("preferredDate") || ""),
      preferredTime: String(formData.get("preferredTime") || ""),
      doctor: String(formData.get("doctor") || ""),
      message: String(formData.get("message") || ""),
    };

    const parsed = appointmentSchema.safeParse(payload);

    if (!parsed.success) {
      setStatus({
        kind: "error",
        message: parsed.error.issues[0]?.message || "請重新確認預約資料。",
      });
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

      setStatus({
        kind: "success",
        message: result.message || "已送出預約，診所將於營業時間與您聯繫。",
      });
      form.reset();
    } catch (error) {
      setStatus({
        kind: "error",
        message: error instanceof Error ? error.message : "送出失敗，請稍後再試。",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-red-900/10 bg-white/95 p-5 shadow-lg shadow-red-950/5">
      <h3 className="text-lg font-semibold text-red-900">門診預約</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <input required minLength={2} maxLength={50} name="name" placeholder="姓名" className="rounded-md border border-stone-300 px-3 py-2 text-sm outline-none ring-red-700/20 transition focus:ring" />
        <input required minLength={8} maxLength={20} name="phone" placeholder="手機號碼" className="rounded-md border border-stone-300 px-3 py-2 text-sm outline-none ring-red-700/20 transition focus:ring" />
      </div>
      <input name="email" type="email" placeholder="Email（選填）" className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none ring-red-700/20 transition focus:ring" />
      <div className="grid gap-3 sm:grid-cols-2">
        <select required name="service" className="rounded-md border border-stone-300 px-3 py-2 text-sm outline-none ring-red-700/20 transition focus:ring">
          <option value="">選擇診療項目</option>
          {serviceList.map((service) => (
            <option key={service} value={service}>
              {service}
            </option>
          ))}
        </select>
        <select required name="doctor" className="rounded-md border border-stone-300 px-3 py-2 text-sm outline-none ring-red-700/20 transition focus:ring">
          <option value="">選擇醫生</option>
          {doctorList.map((doctor) => (
            <option key={doctor} value={doctor}>
              {doctor}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          required
          name="preferredDate"
          type="date"
          onChange={handleDateChange}
          className="rounded-md border border-stone-300 px-3 py-2 text-sm outline-none ring-red-700/20 transition focus:ring"
        />
        <select required name="preferredTime" className="rounded-md border border-stone-300 px-3 py-2 text-sm outline-none ring-red-700/20 transition focus:ring">
          <option value="">選擇時間（09:00-17:00）</option>
          {appointmentTimeOptions.map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </select>
      </div>
      <textarea name="message" rows={4} placeholder="補充症狀與需求" className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none ring-red-700/20 transition focus:ring" />
      <button
        type="submit"
        disabled={status.kind === "loading"}
        className="w-full rounded-md bg-red-800 px-4 py-2 text-sm font-medium text-amber-100 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status.kind === "loading" ? "送出中..." : "送出預約"}
      </button>
      <p className="text-[11px] leading-5 text-stone-500">預約日期僅限週一至週五，時段開放 09:00 至 17:00。</p>
      {status.kind === "success" ? <p className="text-xs text-emerald-700" aria-live="polite">{status.message}</p> : null}
      {status.kind === "error" ? <p className="text-xs text-red-700" aria-live="polite">{status.message}</p> : null}
    </form>
  );
}
