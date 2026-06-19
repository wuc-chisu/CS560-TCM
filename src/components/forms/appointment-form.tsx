"use client";

import { FormEvent, useState } from "react";

const serviceOptions = ["中醫內科", "婦科調理", "針灸治療", "推拿整復", "客製健檢"];

export function AppointmentForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");

    const formData = new FormData(event.currentTarget);

    const payload = {
      name: String(formData.get("name") || ""),
      phone: String(formData.get("phone") || ""),
      email: String(formData.get("email") || ""),
      service: String(formData.get("service") || ""),
      preferredAt: new Date(String(formData.get("preferredAt") || "")).toISOString(),
      message: String(formData.get("message") || ""),
    };

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("submit failed");
      }

      setStatus("success");
      event.currentTarget.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-red-900/10 bg-white/95 p-5 shadow-lg shadow-red-950/5">
      <h3 className="text-lg font-semibold text-red-900">門診預約</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <input required name="name" placeholder="姓名" className="rounded-md border border-stone-300 px-3 py-2 text-sm outline-none ring-red-700/20 transition focus:ring" />
        <input required name="phone" placeholder="手機" className="rounded-md border border-stone-300 px-3 py-2 text-sm outline-none ring-red-700/20 transition focus:ring" />
      </div>
      <input name="email" type="email" placeholder="Email（選填）" className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none ring-red-700/20 transition focus:ring" />
      <div className="grid gap-3 sm:grid-cols-2">
        <select required name="service" className="rounded-md border border-stone-300 px-3 py-2 text-sm outline-none ring-red-700/20 transition focus:ring">
          <option value="">選擇診療項目</option>
          {serviceOptions.map((service) => (
            <option key={service} value={service}>
              {service}
            </option>
          ))}
        </select>
        <input required name="preferredAt" type="datetime-local" className="rounded-md border border-stone-300 px-3 py-2 text-sm outline-none ring-red-700/20 transition focus:ring" />
      </div>
      <textarea name="message" rows={4} placeholder="補充症狀與需求" className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none ring-red-700/20 transition focus:ring" />
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-md bg-red-800 px-4 py-2 text-sm font-medium text-amber-100 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === "loading" ? "送出中..." : "送出預約"}
      </button>
      {status === "success" ? <p className="text-xs text-emerald-700">已送出預約，診所將於營業時間與您聯繫。</p> : null}
      {status === "error" ? <p className="text-xs text-red-700">送出失敗，請確認欄位內容後重試。</p> : null}
    </form>
  );
}
