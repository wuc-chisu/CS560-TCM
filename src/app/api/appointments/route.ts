import { prisma } from "@/lib/prisma";
import { z } from "zod";

const appointmentSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(8),
  email: z.string().email().optional().or(z.literal("")),
  service: z.string().min(2),
  preferredAt: z.string().datetime(),
  message: z.string().max(500).optional().or(z.literal("")),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = appointmentSchema.parse(body);

    const appointment = await prisma.appointment.create({
      data: {
        name: parsed.name,
        phone: parsed.phone,
        email: parsed.email || null,
        service: parsed.service,
        preferredAt: new Date(parsed.preferredAt),
        message: parsed.message || null,
      },
    });

    return Response.json({ success: true, id: appointment.id });
  } catch {
    return Response.json(
      { success: false, message: "預約資料格式有誤，請重新確認。" },
      { status: 400 },
    );
  }
}
