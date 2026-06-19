import { SectionHeading } from "@/components/ui/section-heading";

const services = [
  {
    title: "中醫內科",
    description: "調理腸胃、睡眠、過敏與慢性疲勞，提升日常體能。",
  },
  {
    title: "婦科調理",
    description: "針對經期不適、備孕與產後恢復，提供分期調養。",
  },
  {
    title: "針灸治療",
    description: "緩解肩頸腰背疼痛、偏頭痛與壓力型失眠。",
  },
  {
    title: "推拿整復",
    description: "筋膜放鬆與關節調整，改善久坐與運動引發不適。",
  },
  {
    title: "體質檢測",
    description: "結合舌脈分析與生活習慣評估，建立長期健康計畫。",
  },
  {
    title: "養生飲食建議",
    description: "依節氣與個人體質提供可執行的食補與作息建議。",
  },
];

export function Services() {
  return (
    <section id="services" className="bg-[#f2ebe1] py-16 sm:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="OUR SERVICES" title="專業診療項目" center />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <article
              key={service.title}
              className="rounded-2xl border border-red-900/10 bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-red-900/10"
            >
              <h3 className="text-lg font-semibold text-red-900">{service.title}</h3>
              <p className="mt-3 text-sm leading-7 text-stone-600">{service.description}</p>
              <a href="#contact" className="mt-4 inline-block text-xs font-semibold tracking-wide text-amber-700 hover:text-red-800">
                立即諮詢 →
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
