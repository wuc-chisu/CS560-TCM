import { z } from "zod";

export const appointmentServiceOptions = ["Internal Medicine", "Women's Health", "Acupuncture", "Tuina Bodywork", "Other"] as const;
export const appointmentDoctorOptions = ["Dr. Hanwen Chen", "Dr. Siyu Lin", "Dr. Jingren Zhang"] as const;
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
    patientType: z.enum(["new", "returning"]).optional().or(z.literal("")),
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(50, "Name must be no more than 50 characters"),
    phone: z
      .string()
      .trim()
      .regex(/^[0-9+\-()\s]{8,20}$/, "Enter a valid phone number"),
    email: z
      .string()
      .trim()
      .email("Enter a valid email address")
      .optional()
      .or(z.literal("")),
    service: z.string().trim().min(1, "Select a service").max(50, "Service must be no more than 50 characters"),
    preferredDate: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Select an appointment date")
      .refine(isWeekday, "Appointments are available Monday through Friday only"),
    preferredTime: z.enum(appointmentTimeOptions, "Select an appointment time"),
    doctor: z.string().trim().min(1, "Select a practitioner").max(50, "Practitioner name must be no more than 50 characters"),
    message: z.string().trim().max(500, "Message must be no more than 500 characters").optional().or(z.literal("")),
  })
  .transform((data) => ({
    ...data,
    patientType: data.patientType || "",
    service: data.service.trim(),
    doctor: data.doctor.trim(),
    preferredAt: buildPreferredAt(data.preferredDate, data.preferredTime),
  }));

export type AppointmentInput = z.input<typeof appointmentSchema>;
export type AppointmentData = z.output<typeof appointmentSchema>;