type PlaceholderImageProps = {
  label: string;
};

export const PlaceholderImage = ({ label }: PlaceholderImageProps) => (
  <div className="relative isolate overflow-hidden rounded-2xl border border-stone-700 bg-gradient-to-br from-brand-900 to-brand-700 p-8 shadow-soft">
    <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-accent/20 blur-2xl" aria-hidden />
    <div className="absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" aria-hidden />
    <p className="relative text-sm font-medium uppercase tracking-[0.2em] text-stone-100/90">{label}</p>
    <p className="relative mt-3 text-xl font-semibold text-stone-50">Food and ambience image placeholder</p>
    <p className="relative mt-2 text-sm text-stone-200">Swap this block with optimized photos in `src/assets` when available.</p>
  </div>
);
