"use client";

import { contactSchema } from "@/lib/contact-schema";
import { FormEvent, useState } from "react";

type FormState = {
  kind: "idle" | "loading" | "success" | "error";
  message: string;
};

export function ContactForm() {
  const [status, setStatus] = useState<FormState>({ kind: "idle", message: "" });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;

    event.preventDefault();
    setStatus({ kind: "loading", message: "" });

    const formData = new FormData(form);

    const payload = {
      name: String(formData.get("name") || ""),
      phone: String(formData.get("phone") || ""),
      email: String(formData.get("email") || ""),
      message: String(formData.get("message") || ""),
    };

    const parsed = contactSchema.safeParse(payload);

    if (!parsed.success) {
      setStatus({
        kind: "error",
        message: parsed.error.issues[0]?.message || "請重新確認表單內容。",
      });
      return;
    }

    try {
      const response = await fetch("/api/contact", {
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
        message: result.message || "已收到您的訊息，我們將盡快回覆。",
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
    <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-red-900/10 bg-[#fffdf8] p-5 shadow-lg shadow-red-950/5">
      <h3 className="text-lg font-semibold text-red-900">聯絡我們</h3>
      <input required minLength={2} maxLength={50} name="name" placeholder="姓名" className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none ring-red-700/20 transition focus:ring" />
      <input required minLength={8} maxLength={20} name="phone" placeholder="手機" className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none ring-red-700/20 transition focus:ring" />
      <input name="email" type="email" placeholder="Email（選填）" className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none ring-red-700/20 transition focus:ring" />
      <textarea required minLength={10} maxLength={1000} name="message" rows={4} placeholder="想詢問的內容" className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none ring-red-700/20 transition focus:ring" />
      <button
        type="submit"
        disabled={status.kind === "loading"}
        className="w-full rounded-md border border-red-800 bg-red-800 px-4 py-2 text-sm font-medium text-amber-100 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status.kind === "loading" ? "送出中..." : "送出訊息"}
      </button>
      {status.kind === "success" ? <p className="text-xs text-emerald-700" aria-live="polite">{status.message}</p> : null}
      {status.kind === "error" ? <p className="text-xs text-red-700" aria-live="polite">{status.message}</p> : null}
    </form>
  );
}
