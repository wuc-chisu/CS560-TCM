type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  center?: boolean;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  center = false,
}: SectionHeadingProps) {
  return (
    <div className={center ? "text-center" : ""}>
      <p className="mb-2 text-xs tracking-[0.22em] text-amber-700">{eyebrow}</p>
      <h2 className="text-3xl font-semibold text-stone-900 sm:text-4xl">{title}</h2>
      {description ? (
        <p className="mt-3 text-sm leading-7 text-stone-600 sm:text-base">{description}</p>
      ) : null}
      <div
        className={[
          "mt-4 h-0.5 w-14 bg-gradient-to-r from-red-700 to-amber-500",
          center ? "mx-auto" : "",
        ].join(" ")}
      />
    </div>
  );
}
