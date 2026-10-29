import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(50, "Name must be no more than 50 characters"),
  phone: z.string().trim().min(8, "Enter a valid phone number").max(20, "Phone number must be no more than 20 characters"),
  email: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .optional()
    .or(z.literal("")),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(1000, "Message must be no more than 1,000 characters"),
});

export type ContactInput = z.infer<typeof contactSchema>;