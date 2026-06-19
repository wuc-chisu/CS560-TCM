import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(8),
  email: z.string().email().optional().or(z.literal("")),
  message: z.string().min(10).max(1000),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = contactSchema.parse(body);

    return Response.json({
      success: true,
      received: {
        name: parsed.name,
        phone: parsed.phone,
      },
    });
  } catch {
    return Response.json(
      { success: false, message: "聯絡資料格式有誤，請重新確認。" },
      { status: 400 },
    );
  }
}
