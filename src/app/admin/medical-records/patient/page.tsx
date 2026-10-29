import { PatientDetailsTabs } from "@/components/admin/patient-details-tabs";

type PageProps = {
  searchParams: Promise<{
    name?: string | string[];
    dateOfBirth?: string | string[];
    phone?: string | string[];
  }>;
};

export default async function Page({ searchParams }: PageProps) {
  const query = await searchParams;

  return (
    <PatientDetailsTabs
      patient={{
        name: getSingleValue(query.name),
        dateOfBirth: getSingleValue(query.dateOfBirth),
        phone: getSingleValue(query.phone),
      }}
    />
  );
}

function getSingleValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}
