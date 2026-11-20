import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EncounterForm } from "@/components/admin/encounter-form";

type PageProps = {
  searchParams: Promise<{ id?: string | string[] }>;
};

export default async function Page({ searchParams }: PageProps) {
  const query = await searchParams;
  const id = typeof query.id === "string" ? query.id : "";

  if (!id) notFound();

  const patient = await prisma.patient.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      dateOfBirth: true,
      phone: true,
      email: true,
    },
  });

  if (!patient) notFound();

  return (
    <EncounterForm
      patient={{
        ...patient,
        dateOfBirth: patient.dateOfBirth?.toISOString().slice(0, 10) ?? "",
      }}
    />
  );
}
