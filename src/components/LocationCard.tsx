import type { RestaurantLocation } from '@/data/restaurant';
import { buildMapUrl } from '@/lib/schema';

type LocationCardProps = {
  location: RestaurantLocation;
};

export const LocationCard = ({ location }: LocationCardProps) => (
  <article className="flex h-full flex-col rounded-2xl border border-brand-charcoal/60 bg-brand-charcoal/50 p-5 shadow-soft">
    <h3 className="text-xl font-semibold text-brand-cream">{location.name}</h3>
    <p className="mt-3 text-sm leading-relaxed text-brand-cream/85">{location.address}</p>
    <p className="mt-4 text-sm text-brand-gold">{location.openingHoursPlaceholder}</p>
    <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
      <a className="font-medium text-brand-gold hover:text-brand-cream" href={location.phoneHref}>
        {location.phoneLabel}
      </a>
      <a
        className="rounded-full border border-brand-cream/35 px-4 py-2 font-medium text-brand-cream hover:border-brand-gold hover:text-brand-gold"
        href={buildMapUrl(location.mapsQuery)}
        target="_blank"
        rel="noreferrer"
      >
        View map
      </a>
    </div>
  </article>
);
