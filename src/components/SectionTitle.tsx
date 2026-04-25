type SectionTitleProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
};

export const SectionTitle = ({ eyebrow, title, subtitle }: SectionTitleProps) => (
  <header className="space-y-3">
    {eyebrow ? <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">{eyebrow}</p> : null}
    <h2 className="text-3xl font-bold tracking-tight text-stone-50 sm:text-4xl">{title}</h2>
    {subtitle ? <p className="max-w-2xl text-base text-stone-300">{subtitle}</p> : null}
  </header>
);
