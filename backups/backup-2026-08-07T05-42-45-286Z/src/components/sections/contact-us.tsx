import { ContactUsClient } from "@/components/sections/contact-us-client";
import { appointmentDoctorOptions, appointmentServiceOptions } from "@/lib/appointment-schema";
import { prisma } from "@/lib/prisma";

export async function ContactUs() {
  const [doctorOptions, serviceOptions] = await getAppointmentOptions();

  return <ContactUsClient doctorOptions={[...doctorOptions]} serviceOptions={[...serviceOptions]} />;
}

async function getAppointmentOptions() {
  try {
    const [doctors, services] = await Promise.all([
      prisma.doctor.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "asc" },
        select: { name: true },
      }),
      prisma.service.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "asc" },
        select: { name: true },
      }),
    ]);

    return [
      doctors.map((doctor) => doctor.name),
      services.map((service) => service.name),
    ] as const;
  } catch (error) {
    console.error("Failed to load booking options", error);
    return [[...appointmentDoctorOptions], [...appointmentServiceOptions]] as const;
  }
}
