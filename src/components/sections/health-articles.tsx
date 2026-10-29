import { SectionHeading } from "@/components/ui/section-heading";

const articles = [
  {
    title: "Supporting Your Wellbeing During Summer",
    summary: "Everyday ideas for seasonal nutrition, routines, and acupressure.",
    tag: "Seasonal Wellness",
  },
  {
    title: "Relieving Neck and Shoulder Tension",
    summary: "Explore how stretching and acupuncture may help with recurring tension and headaches.",
    tag: "Pain Management",
  },
  {
    title: "Women's Wellness Throughout the Menstrual Cycle",
    summary: "Learn about care approaches that support comfort and balance throughout your cycle.",
    tag: "Women's Health",
  },
];

export function HealthArticles() {
  return (
    <section id="articles" className="bg-[#efe6da] py-16 sm:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="HEALTH ARTICLES" title="Wellness Insights" description="Explore practical perspectives on traditional Chinese medicine and everyday wellbeing." center />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {articles.map((article) => (
            <article key={article.title} className="rounded-2xl border border-red-900/10 bg-white p-5">
              <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-800">{article.tag}</span>
              <h3 className="mt-4 text-lg font-semibold text-red-900">{article.title}</h3>
              <p className="mt-3 text-sm leading-7 text-stone-600">{article.summary}</p>
              <a href="#" className="mt-4 inline-block text-xs font-semibold tracking-wide text-red-800 hover:text-amber-700">
                Read More →
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
