import { SectionHeading } from "@/components/ui/section-heading";

const doctors = [
  {
    name: "陳漢文 醫師",
    specialty: "中醫內科．針灸疼痛",
    intro: "專精慢性疼痛與自律神經失衡調理，臨床經驗超過 18 年。",
  },
  {
    name: "林思妤 醫師",
    specialty: "婦科調理．美容針灸",
    intro: "擅長女性荷爾蒙平衡、孕前體質調理與肌膚循環改善。",
  },
  {
    name: "張景仁 醫師",
    specialty: "脾胃調理．銀髮養生",
    intro: "深耕銀髮族慢性病照護與術後康復中醫支持方案。",
  },
];

export function Doctors() {
  return (
    <section id="doctors" className="bg-[#f8f2e8] py-16 sm:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="EXPERT TEAM" title="專業醫師團隊" description="由資深醫師領銜，堅持辨證施治與細緻追蹤。" center />
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
