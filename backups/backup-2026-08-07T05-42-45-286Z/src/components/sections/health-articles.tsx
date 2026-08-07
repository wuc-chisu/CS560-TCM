import { SectionHeading } from "@/components/ui/section-heading";

const articles = [
  {
    title: "夏季濕熱體質如何調理？",
    summary: "從飲食、作息到穴位按壓，建立日常可執行的去濕方案。",
    tag: "體質調理",
  },
  {
    title: "長時間久坐的肩頸痠痛改善法",
    summary: "結合伸展與針灸觀點，降低反覆緊繃與頭痛發作頻率。",
    tag: "疼痛管理",
  },
  {
    title: "女性經期前後的養生重點",
    summary: "依週期調整補養方向，讓經期更穩定、情緒更平衡。",
    tag: "婦科照護",
  },
];

export function HealthArticles() {
  return (
    <section id="articles" className="bg-[#efe6da] py-16 sm:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="HEALTH COLUMN" title="健康專欄" description="每週更新中醫觀點，幫助您把保養落實到生活細節。" center />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {articles.map((article) => (
            <article key={article.title} className="rounded-2xl border border-red-900/10 bg-white p-5">
              <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-800">{article.tag}</span>
              <h3 className="mt-4 text-lg font-semibold text-red-900">{article.title}</h3>
              <p className="mt-3 text-sm leading-7 text-stone-600">{article.summary}</p>
              <a href="#" className="mt-4 inline-block text-xs font-semibold tracking-wide text-red-800 hover:text-amber-700">
                閱讀全文 →
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
