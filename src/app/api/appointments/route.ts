import { AppointmentStatus } from "@prisma/client";
import { appointmentSchema } from "@/lib/appointment-schema";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
import { z } from "zod";

class AppointmentConflictError extends Error {}
class AppointmentUnavailableError extends Error {}

const smtpConfigSchema = z.object({
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().positive(),
  SMTP_USER: z.string().email(),
  SMTP_PASS: z.string().min(1),
  CONTACT_FROM_EMAIL: z.string().email().optional(),
});

function getSmtpConfig() {
  return smtpConfigSchema.parse({
    SMTP_HOST: process.env.SMTP_HOST?.trim(),
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER?.trim(),
    SMTP_PASS: process.env.SMTP_PASS?.replace(/\s+/g, ""),
    CONTACT_FROM_EMAIL: process.env.CONTACT_FROM_EMAIL?.trim(),
  });
}

function formatPatientType(patientType: string) {
  switch (patientType) {
    case "new":
      return "New patient";
    case "returning":
      return "Returning patient";
    default:
      return "Not provided";
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

function buildAppointmentEmailContent(parsed: { name: string; patientType: string; service: string; doctor: string; preferredDate: string; preferredTime: string; phone: string; email: string }) {
  const patientTypeLabel = formatPatientType(parsed.patientType || "");
  const lines = [
    "Your appointment request has been submitted.",
    `Patient name: ${parsed.name}`,
    `Patient type: ${patientTypeLabel}`,
    `Service: ${parsed.service}`,
    `Practitioner: ${parsed.doctor}`,
    `Date: ${parsed.preferredDate}`,
    `Time: ${parsed.preferredTime}`,
    `Phone: ${parsed.phone}`,
    `Email: ${parsed.email || "Not provided"}`,
  ];

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.7; color: #1f2937;">
      <h2 style="margin-bottom: 12px;">Your appointment request has been submitted.</h2>
      <p><strong>Patient name:</strong> ${escapeHtml(parsed.name)}</p>
      <p><strong>Patient type:</strong> ${escapeHtml(patientTypeLabel)}</p>
      <p><strong>Service:</strong> ${escapeHtml(parsed.service)}</p>
      <p><strong>Practitioner:</strong> ${escapeHtml(parsed.doctor)}</p>
      <p><strong>Date:</strong> ${escapeHtml(parsed.preferredDate)}</p>
      <p><strong>Time:</strong> ${escapeHtml(parsed.preferredTime)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(parsed.phone)}</p>
      <p><strong>Email:</strong> ${escapeHtml(parsed.email || "Not provided")}</p>
    </div>
  `;

  return { text: lines.join("\n"), html };
}

async function sendAppointmentEmails(parsed: { name: string; patientType: string; service: string; doctor: string; preferredDate: string; preferredTime: string; phone: string; email: string }) {
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

  const fromAddress = smtpConfig.CONTACT_FROM_EMAIL || smtpConfig.SMTP_USER;
  const emailContent = buildAppointmentEmailContent(parsed);
  const adminEmail = "chi@wc.edu";

  const mailTasks = [
    parsed.email
      ? transporter.sendMail({
          from: fromAddress,
          to: parsed.email,
          subject: `Appointment Confirmation: ${parsed.name}`,
          text: emailContent.text,
          html: emailContent.html,
        })
      : Promise.resolve(),
    transporter.sendMail({
      from: fromAddress,
      to: adminEmail,
      subject: `New Appointment Request: ${parsed.name}`,
      text: emailContent.text,
      html: emailContent.html,
    }),
  ];

  await Promise.all(mailTasks);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = appointmentSchema.parse(body);
    const preferredAt = new Date(parsed.preferredAt);
    const preferredDateStart = new Date(`${parsed.preferredDate}T00:00:00`);
    const preferredDateEnd = new Date(`${parsed.preferredDate}T23:59:59.999`);
    const weekday = preferredDateStart.getDay();

    const appointment = await prisma.$transaction(async (tx) => {
      const patient = await tx.patient.upsert({
        where: { phone: parsed.phone },
        update: {
          name: parsed.name,
          email: parsed.email || null,
        },
        create: {
          name: parsed.name,
          phone: parsed.phone,
          email: parsed.email || null,
        },
      });

      const doctor = await tx.doctor.findFirst({
        where: {
          name: parsed.doctor,
          isActive: true,
        },
      });

      if (!doctor) {
        throw new z.ZodError([
          {
            code: "custom",
            path: ["doctor"],
            message: "The selected practitioner is not currently available for booking. Please choose another practitioner.",
          },
        ]);
      }

      const clinicClosure = await tx.clinicClosure.findFirst({
        where: {
          closureDate: {
            gte: preferredDateStart,
            lte: preferredDateEnd,
          },
        },
      });

      if (clinicClosure) {
        const closureReason = clinicClosure.reason ? ` Reason: ${clinicClosure.reason}` : "";
        throw new AppointmentUnavailableError(`The clinic is closed on your selected date.${closureReason} Please choose another date.`);
      }

      const doctorSchedule = await tx.doctorSchedule.findFirst({
        where: {
          doctorId: doctor.id,
          weekday,
          isAvailable: true,
          startTime: {
            lte: parsed.preferredTime,
          },
          endTime: {
            gte: parsed.preferredTime,
          },
        },
      });

      if (!doctorSchedule) {
        throw new AppointmentUnavailableError("The selected practitioner is not available at that date and time. Please choose another time.");
      }

      const service = await tx.service.findFirst({
        where: {
          name: parsed.service,
          isActive: true,
        },
      });

      if (!service) {
        throw new z.ZodError([
          {
            code: "custom",
            path: ["service"],
            message: "The selected service is not currently available for booking. Please choose another service.",
          },
        ]);
      }

      const existingAppointment = await tx.appointment.findFirst({
        where: {
          preferredAt,
          status: {
            in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED],
          },
          OR: [
            { doctorId: doctor.id },
            { doctor: parsed.doctor },
          ],
        },
      });

      if (existingAppointment) {
        throw new AppointmentConflictError("The selected practitioner already has an appointment at that date and time. Please choose another time.");
      }

      return tx.appointment.create({
        data: {
          patientId: patient.id,
          doctorId: doctor.id,
          serviceId: service.id,
          name: parsed.name,
          phone: parsed.phone,
          email: parsed.email || null,
          service: parsed.service,
          doctor: parsed.doctor,
          preferredAt,
          message: parsed.message || null,
        },
      });
    });

    try {
      await sendAppointmentEmails({
        name: parsed.name,
        patientType: parsed.patientType || "",
        service: parsed.service,
        doctor: parsed.doctor,
        preferredDate: parsed.preferredDate,
        preferredTime: parsed.preferredTime,
        phone: parsed.phone,
        email: parsed.email || "",
      });
    } catch (mailError) {
      console.error("Appointment email sending failed", mailError);
    }

    return Response.json({
      success: true,
      id: appointment.id,
      message: "Your appointment request has been submitted. The clinic will contact you during business hours.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { success: false, message: error.issues[0]?.message || "The appointment details are invalid. Please review and try again." },
        { status: 400 },
      );
    }

    if (error instanceof AppointmentConflictError) {
      return Response.json(
        { success: false, message: error.message },
        { status: 409 },
      );
    }

    if (error instanceof AppointmentUnavailableError) {
      return Response.json(
        { success: false, message: error.message },
        { status: 409 },
      );
    }

    console.error("Appointment submission failed", error);

    return Response.json(
      { success: false, message: "We couldn't submit your appointment request. Please try again later or call the clinic." },
      { status: 500 },
    );
  }
}
