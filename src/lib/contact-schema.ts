import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "姓名至少需要 2 個字").max(50, "姓名不可超過 50 個字"),
  phone: z.string().trim().min(8, "請輸入有效的聯絡電話").max(20, "電話不可超過 20 個字"),
  email: z
    .string()
    .trim()
    .email("請輸入有效的 Email")
    .optional()
    .or(z.literal("")),
  message: z.string().trim().min(10, "訊息至少需要 10 個字").max(1000, "訊息不可超過 1000 個字"),
});

export type ContactInput = z.infer<typeof contactSchema>;