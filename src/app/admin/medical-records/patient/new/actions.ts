"use server";

import { getAdminAccess } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { usStateAbbreviations } from "@/lib/us-states";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const phonePattern = /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/;
const emailPattern = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/;

function isValidDate(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

const optionalDate = z.union([
  z.literal(""),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(isValidDate, "Enter a valid date."),
]);

const optionalPhone = z.string().refine(
  (value) => value === "" || phonePattern.test(value),
  "Enter a 10-digit phone number in the format 555-123-4567.",
);

const optionalEmail = z.string().refine(
  (value) => value === "" || emailPattern.test(value),
  "Enter a valid email address, such as name@example.com.",
);

const intakeSchema = z.object({
  firstName: z.string().trim().min(1, "Enter the patient's first name."),
  middleName: z.string().trim(),
  lastName: z.string().trim().min(1, "Enter the patient's last name."),
  preferredName: z.string().trim(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(isValidDate, "Enter a valid date of birth."),
  gender: z.enum(["female", "male", "other", "undisclosed"]),
  preferredLanguage: z.string().trim(),
  maritalStatus: z.enum(["", "single", "married", "partnered", "divorced", "widowed", "undisclosed"]),
  occupation: z.string().trim(),
  phone: z.string().regex(phonePattern, "Enter a 10-digit phone number in the format 555-123-4567."),
  email: optionalEmail,
  address: z.string().trim().min(1, "Enter the patient's street address."),
  addressLine2: z.string().trim(),
  city: z.string().trim().min(1, "Enter the patient's city."),
  state: z.enum(usStateAbbreviations, "Select a valid state."),
  zipCode: z.string().trim().min(1, "Enter the patient's ZIP code."),
  preferredContactMethod: z.enum(["", "phone", "email", "text"]),
  emergencyFirstName: z.string().trim().min(1, "Enter the emergency contact's first name."),
  emergencyLastName: z.string().trim().min(1, "Enter the emergency contact's last name."),
  emergencyRelationship: z.string().trim().min(1, "Enter the emergency contact's relationship to the patient."),
  emergencyPhone: z.string().regex(phonePattern, "Enter a 10-digit phone number in the format 555-123-4567."),
  emergencyEmail: optionalEmail,
  willUseInsurance: z.enum(["yes", "no"], "Select whether the patient will use insurance."),
  insuranceProvider: z.string().trim(),
  insuranceMemberId: z.string().trim(),
  insuranceGroupNumber: z.string().trim(),
  policyholderName: z.string().trim(),
  policyholderRelationship: z.string().trim(),
  policyholderDateOfBirth: optionalDate,
  insuranceEffectiveDate: optionalDate,
  allergies: z.string().trim(),
  currentMedications: z.string().trim(),
  majorMedicalConditions: z.string().trim(),
  previousSurgeriesOrHospitalizations: z.string().trim(),
  pregnancyStatus: z.enum(["", "not-applicable", "pregnant", "not-pregnant", "unsure", "undisclosed"]),
  primaryCarePhysician: z.string().trim(),
  primaryCarePhysicianPhone: optionalPhone,
  previousAcupunctureExperience: z.enum(["", "none", "some", "regular", "unsure"]),
}).superRefine((data, context) => {
  if (data.willUseInsurance === "yes") {
    const requiredInsuranceFields = [
      ["insuranceProvider", data.insuranceProvider, "Enter the insurance company."],
      ["insuranceMemberId", data.insuranceMemberId, "Enter the member ID."],
      ["policyholderName", data.policyholderName, "Enter the policy holder's name."],
      ["policyholderRelationship", data.policyholderRelationship, "Enter the policy holder's relationship to the patient."],
    ] as const;

    for (const [field, value, message] of requiredInsuranceFields) {
      if (!value) {
        context.addIssue({ code: "custom", path: [field], message });
      }
    }
  }
});

const formFieldNames = [
  "firstName",
  "middleName",
  "lastName",
  "preferredName",
  "dateOfBirth",
  "gender",
  "preferredLanguage",
  "maritalStatus",
  "occupation",
  "phone",
  "email",
  "address",
  "addressLine2",
  "city",
  "state",
  "zipCode",
  "preferredContactMethod",
  "emergencyFirstName",
  "emergencyLastName",
  "emergencyRelationship",
  "emergencyPhone",
  "emergencyEmail",
  "willUseInsurance",
  "insuranceProvider",
  "insuranceMemberId",
  "insuranceGroupNumber",
  "policyholderName",
  "policyholderRelationship",
  "policyholderDateOfBirth",
  "insuranceEffectiveDate",
  "allergies",
  "currentMedications",
  "majorMedicalConditions",
  "previousSurgeriesOrHospitalizations",
  "pregnancyStatus",
  "primaryCarePhysician",
  "primaryCarePhysicianPhone",
  "previousAcupunctureExperience",
] as const;

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function nullable(value: string) {
  return value || null;
}

function parseOptionalDate(value: string) {
  return value ? new Date(`${value}T00:00:00.000Z`) : null;
}

export async function savePatientIntake(formData: FormData) {
  const access = await getAdminAccess();
  if (access.status !== "admin") {
    throw new Error("Forbidden");
  }

  const formValues = Object.fromEntries(
    formFieldNames.map((fieldName) => [fieldName, getString(formData, fieldName)]),
  );
  const parsed = intakeSchema.safeParse(formValues);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Review the patient information and try again." };
  }

  const values = parsed.data;
  const useInsurance = values.willUseInsurance === "yes";
  const patientName = [values.firstName, values.middleName, values.lastName].filter(Boolean).join(" ");

  let patient: { id: string };
  try {
    patient = await prisma.patient.create({
      data: {
        name: patientName,
        firstName: values.firstName,
        middleName: nullable(values.middleName),
        lastName: values.lastName,
        preferredName: nullable(values.preferredName),
        dateOfBirth: new Date(`${values.dateOfBirth}T00:00:00.000Z`),
        gender: values.gender,
        preferredLanguage: nullable(values.preferredLanguage),
        maritalStatus: nullable(values.maritalStatus),
        occupation: nullable(values.occupation),
        phone: values.phone,
        email: nullable(values.email),
        address: values.address,
        addressLine2: nullable(values.addressLine2),
        city: values.city,
        state: values.state,
        zipCode: values.zipCode,
        preferredContactMethod: nullable(values.preferredContactMethod),
        emergencyFirstName: values.emergencyFirstName,
        emergencyLastName: values.emergencyLastName,
        emergencyRelationship: values.emergencyRelationship,
        emergencyPhone: values.emergencyPhone,
        emergencyEmail: nullable(values.emergencyEmail),
        willUseInsurance: useInsurance,
        insuranceProvider: useInsurance ? nullable(values.insuranceProvider) : null,
        insuranceMemberId: useInsurance ? nullable(values.insuranceMemberId) : null,
        insuranceGroupNumber: useInsurance ? nullable(values.insuranceGroupNumber) : null,
        policyholderName: useInsurance ? nullable(values.policyholderName) : null,
        policyholderRelationship: useInsurance ? nullable(values.policyholderRelationship) : null,
        policyholderDateOfBirth: useInsurance ? parseOptionalDate(values.policyholderDateOfBirth) : null,
        insuranceEffectiveDate: useInsurance ? parseOptionalDate(values.insuranceEffectiveDate) : null,
        allergies: nullable(values.allergies),
        currentMedications: nullable(values.currentMedications),
        majorMedicalConditions: nullable(values.majorMedicalConditions),
        previousSurgeriesOrHospitalizations: nullable(values.previousSurgeriesOrHospitalizations),
        pregnancyStatus: nullable(values.pregnancyStatus),
        primaryCarePhysician: nullable(values.primaryCarePhysician),
        primaryCarePhysicianPhone: nullable(values.primaryCarePhysicianPhone),
        previousAcupunctureExperience: nullable(values.previousAcupunctureExperience),
      },
      select: { id: true },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "A patient with this phone number already exists." };
    }
    throw error;
  }

  revalidatePath("/admin/medical-records");
  redirect(`/admin/medical-records/patient?id=${encodeURIComponent(patient.id)}`);
}
