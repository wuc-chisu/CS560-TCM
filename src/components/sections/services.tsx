import { SectionHeading } from "@/components/ui/section-heading";

const services = [
  {
    title: "Internal Medicine",
    description: "Support for digestive concerns, sleep, allergies, and chronic fatigue.",
  },
  {
    title: "Women's Health",
    description: "Personalized support for menstrual health, fertility preparation, and postpartum recovery.",
  },
  {
    title: "Acupuncture",
    description: "Care for neck, shoulder, and back pain, migraines, and stress-related sleep concerns.",
  },
  {
    title: "Tuina Bodywork",
    description: "Hands-on care to address muscle tension and discomfort related to sitting or exercise.",
  },
  {
    title: "Wellness Assessment",
    description: "A holistic review of your health and lifestyle to inform an ongoing wellness plan.",
  },
  {
    title: "Nutrition & Lifestyle Guidance",
    description: "Practical nutrition and routine recommendations tailored to your needs and the seasons.",
  },
];

export function Services() {
  return (
    <section id="services" className="bg-[#f2ebe1] py-16 sm:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="OUR SERVICES" title="Care and Services" center />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <article
              key={service.title}
              className="rounded-2xl border border-red-900/10 bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-red-900/10"
            >
              <h3 className="text-lg font-semibold text-red-900">{service.title}</h3>
              <p className="mt-3 text-sm leading-7 text-stone-600">{service.description}</p>
              <a href="#contact" className="mt-4 inline-block text-xs font-semibold tracking-wide text-amber-700 hover:text-red-800">
                Learn More →
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
