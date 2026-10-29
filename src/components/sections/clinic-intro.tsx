import { SectionHeading } from "@/components/ui/section-heading";

const introItems = [
  { title: "Experienced TCM Practitioners", text: "Our licensed practitioners bring clinical experience and thoughtful, individualized care." },
  { title: "Personalized Wellness Plans", text: "Care plans are tailored to your constitution, lifestyle, and ongoing health goals." },
  { title: "A Welcoming Clinic", text: "A warm, calming space designed to make every visit more comfortable." },
  { title: "Integrated Care", text: "We offer a range of traditional therapies to support pain relief and overall wellbeing." },
];

export function ClinicIntro() {
  return (
    <section id="about" className="bg-[#f8f2e8] py-16 sm:py-20">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:px-8">
        <div>
          <SectionHeading
            eyebrow="ABOUT US"
            title="Compassionate Care for Mind and Body"
            description="Combining the wisdom of traditional Chinese medicine with a modern perspective, He An provides attentive care to help you build lasting wellbeing."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {introItems.map((item) => (
              <article key={item.title} className="rounded-xl border border-red-900/10 bg-white/80 p-4">
                <h3 className="text-base font-semibold text-red-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-stone-600">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
        <div className="relative overflow-hidden rounded-3xl border border-red-900/10 bg-gradient-to-b from-[#ecd8bf] to-[#f6ecde] p-6">
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-200/50 blur-2xl" />
          <p className="text-sm text-stone-700">Clinical Experience</p>
          <p className="mt-2 text-5xl font-semibold text-red-900">20+</p>
          <p className="mt-1 text-sm text-stone-600">Years of combined TCM team experience</p>
          <div className="mt-10 space-y-3 text-sm text-stone-700">
            <p>• Dedicated one-on-one consultations</p>
            <p>• Practical wellness and nutrition guidance after your visit</p>
            <p>• Women-focused appointments and senior-friendly care</p>
          </div>
        </div>
      </div>
    </section>
  );
}
