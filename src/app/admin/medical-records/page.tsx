import { PatientList } from "@/components/admin/patient-list";
import { prisma } from "@/lib/prisma";

export default async function Page() {
  const patients = await prisma.patient.findMany({
    select: {
      id: true,
      name: true,
      dateOfBirth: true,
      phone: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <PatientList
      patients={patients.map((patient) => ({
        ...patient,
        dateOfBirth: patient.dateOfBirth?.toISOString().slice(0, 10) ?? "",
        lastVisit: null,
      }))}
    />
  );
}
