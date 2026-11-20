"use server";

import { getAdminAccess } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type DeletePatientResult =
  | { error: string; success?: never }
  | { success: true; error?: never };

export async function deletePatientRecord(patientId: string): Promise<DeletePatientResult> {
  const access = await getAdminAccess();
  if (access.status !== "admin") {
    throw new Error("Forbidden");
  }

  if (!patientId || patientId.length > 100) {
    return { error: "Invalid patient record." };
  }

  const result = await prisma.patient.deleteMany({ where: { id: patientId } });
  if (result.count === 0) {
    return { error: "This patient record no longer exists. Refresh the page and try again." };
  }

  revalidatePath("/admin/medical-records");
  revalidatePath("/admin/medical-records/patient");
  return { success: true };
}
