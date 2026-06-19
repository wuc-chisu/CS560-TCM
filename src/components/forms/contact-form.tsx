"use client";

import { FormEvent, useState } from "react";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");

    const formData = new FormData(event.currentTarget);

    const payload = {
      name: String(formData.get("name") || ""),
      phone: String(formData.get("phone") || ""),
      email: String(formData.get("email") || ""),
      message: String(formData.get("message") || ""),
    };

    try {
      const response = await fetch("/api/contact", {
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
    <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-red-900/10 bg-[#fffdf8] p-5 shadow-lg shadow-red-950/5">
      <h3 className="text-lg font-semibold text-red-900">聯絡我們</h3>
      <input required name="name" placeholder="姓名" className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none ring-red-700/20 transition focus:ring" />
      <input required name="phone" placeholder="手機" className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none ring-red-700/20 transition focus:ring" />
      <input name="email" type="email" placeholder="Email（選填）" className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none ring-red-700/20 transition focus:ring" />
      <textarea required name="message" rows={4} placeholder="想詢問的內容" className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none ring-red-700/20 transition focus:ring" />
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-md border border-red-800 bg-red-800 px-4 py-2 text-sm font-medium text-amber-100 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === "loading" ? "送出中..." : "送出訊息"}
      </button>
      {status === "success" ? <p className="text-xs text-emerald-700">已收到您的訊息，我們將盡快回覆。</p> : null}
      {status === "error" ? <p className="text-xs text-red-700">送出失敗，請稍後再試。</p> : null}
    </form>
  );
}
