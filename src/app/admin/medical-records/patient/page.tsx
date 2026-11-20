import { PatientDetailsTabs } from "@/components/admin/patient-details-tabs";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type PageProps = {
  searchParams: Promise<{
    id?: string | string[];
    name?: string | string[];
    dateOfBirth?: string | string[];
    phone?: string | string[];
  }>;
};

export default async function Page({ searchParams }: PageProps) {
  const query = await searchParams;
  const id = getSingleValue(query.id);

  if (id) {
    const patient = await prisma.patient.findUnique({ where: { id } });
    if (!patient) notFound();

    return (
      <PatientDetailsTabs
        patientId={patient.id}
        patient={{
          name: patient.name,
          firstName: patient.firstName ?? "",
          middleName: patient.middleName ?? "",
          lastName: patient.lastName ?? "",
          preferredName: patient.preferredName ?? "",
          dateOfBirth: patient.dateOfBirth ? formatDateValue(patient.dateOfBirth) : "",
          gender: patient.gender ?? "",
          preferredLanguage: patient.preferredLanguage ?? "",
          maritalStatus: patient.maritalStatus ?? "",
          occupation: patient.occupation ?? "",
          phone: patient.phone,
          email: patient.email ?? "",
          address: patient.address ?? "",
          addressLine2: patient.addressLine2 ?? "",
          city: patient.city ?? "",
          state: patient.state ?? "",
          zipCode: patient.zipCode ?? "",
          preferredContactMethod: patient.preferredContactMethod ?? "",
          emergencyFirstName: patient.emergencyFirstName ?? "",
          emergencyLastName: patient.emergencyLastName ?? "",
          emergencyRelationship: patient.emergencyRelationship ?? "",
          emergencyPhone: patient.emergencyPhone ?? "",
          emergencyEmail: patient.emergencyEmail ?? "",
          willUseInsurance: patient.willUseInsurance,
          insuranceProvider: patient.insuranceProvider ?? "",
          insuranceMemberId: patient.insuranceMemberId ?? "",
          insuranceGroupNumber: patient.insuranceGroupNumber ?? "",
          policyholderName: patient.policyholderName ?? "",
          policyholderRelationship: patient.policyholderRelationship ?? "",
          policyholderDateOfBirth: patient.policyholderDateOfBirth
            ? formatDateValue(patient.policyholderDateOfBirth)
            : "",
          insuranceEffectiveDate: patient.insuranceEffectiveDate
            ? formatDateValue(patient.insuranceEffectiveDate)
            : "",
          allergies: patient.allergies ?? "",
          currentMedications: patient.currentMedications ?? "",
          majorMedicalConditions: patient.majorMedicalConditions ?? "",
          previousSurgeriesOrHospitalizations: patient.previousSurgeriesOrHospitalizations ?? "",
          pregnancyStatus: patient.pregnancyStatus ?? "",
          primaryCarePhysician: patient.primaryCarePhysician ?? "",
          primaryCarePhysicianPhone: patient.primaryCarePhysicianPhone ?? "",
          previousAcupunctureExperience: patient.previousAcupunctureExperience ?? "",
        }}
      />
    );
  }

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

function formatDateValue(value: Date) {
  return value.toISOString().slice(0, 10);
}
