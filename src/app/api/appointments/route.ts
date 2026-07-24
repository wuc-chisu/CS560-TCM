import { AppointmentStatus } from "@prisma/client";
import { appointmentSchema } from "@/lib/appointment-schema";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

class AppointmentConflictError extends Error {}
class AppointmentUnavailableError extends Error {}

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
            message: "選擇的醫師目前不可預約，請重新選擇。",
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
        const closureReason = clinicClosure.reason ? `：${clinicClosure.reason}` : "";
        throw new AppointmentUnavailableError(`您選擇的日期為休診日${closureReason}，請改選其他日期。`);
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
        throw new AppointmentUnavailableError("此醫師在您選擇的日期與時間未開放門診，請改選其他時段。");
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
            message: "選擇的診療項目目前不可預約，請重新選擇。",
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
        throw new AppointmentConflictError("此醫師在您選擇的日期與時間已有預約，請改選其他時段。");
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

    return Response.json({
      success: true,
      id: appointment.id,
      message: "已送出預約，診所將於營業時間與您聯繫。",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { success: false, message: error.issues[0]?.message || "預約資料格式有誤，請重新確認。" },
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
      { success: false, message: "系統暫時無法送出預約，請稍後再試或直接來電聯絡。" },
      { status: 500 },
    );
  }
}
