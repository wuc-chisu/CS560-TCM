import { z } from "zod";

export const appointmentServiceOptions = ["中醫內科", "婦科", "針灸", "推拿", "其它"] as const;
export const appointmentDoctorOptions = ["陳醫師", "林醫師", "何醫師"] as const;
export const appointmentTimeOptions = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
] as const;

function isWeekday(value: string) {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const day = date.getDay();
  return day >= 1 && day <= 5;
}

function buildPreferredAt(date: string, time: string) {
  return `${date}T${time}:00`;
}

export const appointmentSchema = z
  .object({
    name: z.string().trim().min(2, "姓名至少需要 2 個字").max(50, "姓名不可超過 50 個字"),
    phone: z
      .string()
      .trim()
      .regex(/^[0-9+\-()\s]{8,20}$/, "請輸入有效的手機號碼"),
    email: z
      .string()
      .trim()
      .email("請輸入有效的 Email")
      .optional()
      .or(z.literal("")),
    service: z.string().trim().min(1, "請選擇診療項目").max(50, "診療項目不可超過 50 個字"),
    preferredDate: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "請選擇預約日期")
      .refine(isWeekday, "預約日期僅限週一至週五"),
    preferredTime: z.enum(appointmentTimeOptions, "請選擇預約時間"),
    doctor: z.string().trim().min(1, "請選擇醫師").max(50, "醫師名稱不可超過 50 個字"),
    message: z.string().trim().max(500, "補充症狀與需求不可超過 500 個字").optional().or(z.literal("")),
  })
  .transform((data) => ({
    ...data,
    service: data.service.trim(),
    doctor: data.doctor.trim(),
    preferredAt: buildPreferredAt(data.preferredDate, data.preferredTime),
  }));

export type AppointmentInput = z.input<typeof appointmentSchema>;
export type AppointmentData = z.output<typeof appointmentSchema>;