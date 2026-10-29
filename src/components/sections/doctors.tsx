import { SectionHeading } from "@/components/ui/section-heading";

const doctors = [
  {
    name: "Hanwen Chen, L.Ac.",
    specialty: "Internal Medicine & Acupuncture",
    intro: "Specializes in chronic pain and nervous system support, with over 18 years of clinical experience.",
  },
  {
    name: "Siyu Lin, L.Ac.",
    specialty: "Women's Health & Cosmetic Acupuncture",
    intro: "Focuses on women's wellness, preconception support, and skin health.",
  },
  {
    name: "Jingren Zhang, L.Ac.",
    specialty: "Digestive Health & Senior Wellness",
    intro: "Provides traditional medicine support for chronic conditions and post-surgical recovery.",
  },
];

export function Doctors() {
  return (
    <section id="doctors" className="bg-[#f8f2e8] py-16 sm:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="OUR TEAM" title="Meet Our Practitioners" description="Experienced practitioners committed to attentive, individualized care." center />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {doctors.map((doctor) => (
            <article key={doctor.name} className="rounded-2xl border border-red-900/10 bg-white p-5 text-center shadow-sm">
              <div className="mx-auto h-28 w-28 rounded-full border-2 border-amber-500/40 bg-[radial-gradient(circle_at_30%_20%,#f4d9a8,#b08968)]" />
              <h3 className="mt-4 text-lg font-semibold text-red-900">{doctor.name}</h3>
              <p className="mt-1 text-sm text-amber-700">{doctor.specialty}</p>
              <p className="mt-3 text-sm leading-7 text-stone-600">{doctor.intro}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
