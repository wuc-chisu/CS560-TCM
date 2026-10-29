import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const doctors = [
  { name: "Dr. Hanwen Chen", specialty: "Internal Medicine & Acupuncture" },
  { name: "Dr. Siyu Lin", specialty: "Women's Health & Acupuncture" },
  { name: "Dr. Jingren Zhang", specialty: "Digestive Health & Senior Wellness" },
];

const services = [
  { name: "Internal Medicine", durationMinutes: 60 },
  { name: "Women's Health", durationMinutes: 60 },
  { name: "Acupuncture", durationMinutes: 60 },
  { name: "Tuina Bodywork", durationMinutes: 60 },
  { name: "Other", durationMinutes: 60 },
];

const weekdaySchedules = [1, 2, 3, 4, 5];

async function main() {
  for (const doctor of doctors) {
    const doctorRecord = await prisma.doctor.upsert({
      where: { name: doctor.name },
      update: {
        specialty: doctor.specialty,
        isActive: true,
      },
      create: {
        name: doctor.name,
        specialty: doctor.specialty,
        isActive: true,
      },
    });

    for (const weekday of weekdaySchedules) {
      await prisma.doctorSchedule.upsert({
        where: {
          doctorId_weekday_startTime_endTime: {
            doctorId: doctorRecord.id,
            weekday,
            startTime: "09:00",
            endTime: "17:00",
          },
        },
        update: {
          isAvailable: true,
        },
        create: {
          doctorId: doctorRecord.id,
          weekday,
          startTime: "09:00",
          endTime: "17:00",
          isAvailable: true,
        },
      });
    }
  }

  for (const service of services) {
    await prisma.service.upsert({
      where: { name: service.name },
      update: {
        durationMinutes: service.durationMinutes,
        isActive: true,
      },
      create: {
        name: service.name,
        durationMinutes: service.durationMinutes,
        isActive: true,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Prisma seed failed", error);
    await prisma.$disconnect();
    process.exit(1);
  });