import { SectionHeading } from "@/components/ui/section-heading";

const introItems = [
  { title: "專業中醫團隊", text: "主治醫師皆具中醫師執照與臨床經驗，提供精準辨證。" },
  { title: "客製化調理", text: "依體質與生活型態設計專屬療程，並建立回診追蹤。" },
  { title: "舒心診療空間", text: "以木質與暖光打造靜心環境，降低看診壓力與緊張感。" },
  { title: "多元治療整合", text: "整合內科、婦科、針灸與推拿，改善慢性疲勞與疼痛。" },
];

export function ClinicIntro() {
  return (
    <section id="about" className="bg-[#f8f2e8] py-16 sm:py-20">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:px-8">
        <div>
          <SectionHeading
            eyebrow="ABOUT US"
            title="以仁心醫術，守護您的身心平衡"
            description="秉持古法精髓與現代醫學觀點，和安中醫診所重視每一次問診與脈診，從根本改善體質，陪伴您找回穩定健康。"
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
          <p className="text-sm text-stone-700">執業經驗</p>
          <p className="mt-2 text-5xl font-semibold text-red-900">20+</p>
          <p className="mt-1 text-sm text-stone-600">年中醫臨床團隊整合經驗</p>
          <div className="mt-10 space-y-3 text-sm text-stone-700">
            <p>• 一對一問診時間充足，細緻辨證</p>
            <p>• 門診後提供日常調養建議與飲食方向</p>
            <p>• 設有女性專屬時段與銀髮友善服務</p>
          </div>
        </div>
      </div>
    </section>
  );
}
