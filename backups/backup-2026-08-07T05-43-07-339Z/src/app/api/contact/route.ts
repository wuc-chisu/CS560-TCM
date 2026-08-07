import { contactSchema } from "@/lib/contact-schema";
import nodemailer from "nodemailer";
import { z } from "zod";

const smtpConfigSchema = z.object({
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().positive(),
  SMTP_USER: z.string().email(),
  SMTP_PASS: z.string().min(1),
  CONTACT_TO_EMAIL: z.string().email(),
  CONTACT_FROM_EMAIL: z.string().email().optional(),
});

function getSmtpConfig() {
  return smtpConfigSchema.parse({
    SMTP_HOST: process.env.SMTP_HOST?.trim(),
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER?.trim(),
    SMTP_PASS: process.env.SMTP_PASS?.replace(/\s+/g, ""),
    CONTACT_TO_EMAIL: process.env.CONTACT_TO_EMAIL?.trim(),
    CONTACT_FROM_EMAIL: process.env.CONTACT_FROM_EMAIL?.trim(),
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = contactSchema.parse(body);

    const smtpConfig = getSmtpConfig();
    const transporter = nodemailer.createTransport({
      host: smtpConfig.SMTP_HOST,
      port: smtpConfig.SMTP_PORT,
      secure: smtpConfig.SMTP_PORT === 465,
      auth: {
        user: smtpConfig.SMTP_USER,
        pass: smtpConfig.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: smtpConfig.CONTACT_FROM_EMAIL || smtpConfig.SMTP_USER,
      to: smtpConfig.CONTACT_TO_EMAIL,
      replyTo: parsed.email || smtpConfig.SMTP_USER,
      subject: `網站聯絡表單：${parsed.name}`,
      text: [
        "收到新的 Contact Us 訊息",
        `姓名：${parsed.name}`,
        `電話：${parsed.phone}`,
        `Email：${parsed.email || "未提供"}`,
        "",
        "訊息內容：",
        parsed.message,
      ].join("\n"),
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.7; color: #1f2937;">
          <h2 style="margin-bottom: 16px;">收到新的 Contact Us 訊息</h2>
          <p><strong>姓名：</strong>${escapeHtml(parsed.name)}</p>
          <p><strong>電話：</strong>${escapeHtml(parsed.phone)}</p>
          <p><strong>Email：</strong>${escapeHtml(parsed.email || "未提供")}</p>
          <p><strong>訊息內容：</strong></p>
          <p style="white-space: pre-wrap;">${escapeHtml(parsed.message)}</p>
        </div>
      `,
    });

    return Response.json({
      success: true,
      message: "訊息已送出，我們會盡快與您聯繫。",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { success: false, message: error.issues[0]?.message || "聯絡資料格式有誤，請重新確認。" },
        { status: 400 },
      );
    }

    console.error("Contact form submission failed", error);

    return Response.json(
      { success: false, message: "系統暫時無法送出訊息，請稍後再試或直接來電聯絡。" },
      { status: 500 },
    );
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
