"use server";

import { getAdminAccess } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { AppointmentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function updateAppointmentStatus(formData: FormData) {
  const access = await getAdminAccess();

  if (access.status !== "admin") {
    throw new Error("Forbidden");
  }

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!id || (status !== AppointmentStatus.CONFIRMED && status !== AppointmentStatus.CANCELLED)) {
    throw new Error("Invalid request");
  }

  await prisma.appointment.updateMany({
    where: { id, status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] } },
    data: { status },
  });

  revalidatePath("/admin/appointments");
}
