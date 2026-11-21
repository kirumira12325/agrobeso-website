import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SiteFrame } from '@/components/SiteFrame';
import { locations, locationPages, signatureDishes, dishDescriptions, type RestaurantLocation } from '@/data/restaurant';
import { buildMapUrl } from '@/lib/schema';
import { applyPageSeo } from '@/lib/seo';
import { injectJsonLd } from '@/lib/jsonld';

const SITE = 'https://www.agrobeso.org';
const HERO_IMG = 'https://kbopqzhfckbhkumiinmk.supabase.co/storage/v1/object/public/images/dish-jollof_rice-1778448765053.png';

type Props = { id: RestaurantLocation['id'] };

export default function LocationPage({ id }: Props) {
  const loc = locations.find((l) => l.id === id)!;
  const page = locationPages[id];
  const other = locations.find((l) => l.id !== id)!;
  const path = `/${id}`;

  useEffect(() => {
    const cleanupSeo = applyPageSeo({ title: page.seoTitle, description: page.seoDescription, path });
    const cleanupLd = injectJsonLd(`ld-${id}`, {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Restaurant',
          '@id': `${SITE}${path}#restaurant`,
          name: loc.name,
          url: `${SITE}${path}`,
          image: HERO_IMG,
          telephone: loc.phoneHref.replace('tel:', ''),
          servesCuisine: ['Ghanaian', 'West African', 'African'],
          priceRange: '££',
          acceptsReservations: true,
          menu: `${SITE}/menu`,
          hasMap: buildMapUrl(loc.mapsQuery),
          address: {
            '@type': 'PostalAddress',
            streetAddress: loc.address.split(',')[0],
            addressLocality: loc.shortName,
            addressRegion: 'London',
            postalCode: loc.address.match(/[A-Z]{1,2}\d[\dA-Z]? ?\d[A-Z]{2}/)?.[0] ?? '',
            addressCountry: 'GB',
          },
          geo: { '@type': 'GeoCoordinates', latitude: page.lat, longitude: page.lng },
          openingHoursSpecification: [{
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            opens: '12:00',
            closes: '21:30',
          }],
          parentOrganization: { '@type': 'Organization', name: 'Agrobeso', url: `${SITE}/` },
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
            { '@type': 'ListItem', position: 2, name: loc.shortName, item: `${SITE}${path}` },
          ],
        },
      ],
    });
    window.scrollTo(0, 0);
    return () => { cleanupSeo(); cleanupLd(); };
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const mapEmbed = `https://www.google.com/maps?q=${encodeURIComponent(loc.mapsQuery)}&output=embed`;

  return (
    <SiteFrame>
      <section className="hero-pattern">
        <div className="section-shell py-16 lg:py-24">
          <p className="eyebrow">Agrobeso · {loc.shortName}</p>
          <h1 className="display mt-4 text-4xl sm:text-6xl">{page.h1}</h1>
          <p className="dek mt-6 max-w-2xl">{page.intro}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/reserve" className="primary-btn">Reserve a table</Link>
            <a href={loc.phoneHref} className="secondary-btn">Call {loc.phoneLabel}</a>
          </div>
        </div>
      </section>

      <section className="section-shell grid grid-cols-1 gap-12 py-16 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h2 className="font-display text-3xl font-light tracking-tightest text-brand-cocoa">Find us</h2>
          <address className="mt-6 not-italic text-brand-cocoa/80">
            <p className="text-lg">{loc.name}</p>
            <p className="mt-1">{loc.address}</p>
            <p className="mt-4"><a href={loc.phoneHref} className="border-b border-brand-cocoa pb-0.5">{loc.phoneLabel}</a></p>
          </address>
          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-brand-cocoa/70">
            <dt className="font-mono text-[10px] uppercase tracking-widest2 text-brand-cocoa/50">Opening hours</dt>
            <dd>{loc.openingHoursPlaceholder}</dd>
            <dt className="font-mono text-[10px] uppercase tracking-widest2 text-brand-cocoa/50">Service</dt>
            <dd>Dine-in · Takeaway · Group bookings</dd>
          </dl>
          <a href={buildMapUrl(loc.mapsQuery)} target="_blank" rel="noopener noreferrer" className="mt-8 inline-block font-mono text-[11px] uppercase tracking-widest2 text-brand-cocoa">
            <span className="border-b border-brand-cocoa pb-1">Get directions &rarr;</span>
          </a>
          <h3 className="mt-12 font-mono text-[10px] uppercase tracking-widest2 text-brand-cocoa/50">Getting here</h3>
          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-brand-cocoa/70">
            {page.gettingHere.map((g) => <li key={g}>{g}</li>)}
          </ul>
        </div>
        <div className="lg:col-span-7">
          <iframe
            title={`Map of Agrobeso ${loc.shortName}`}
            src={mapEmbed}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-[360px] w-full rounded-lg border border-brand-cocoa/10 lg:h-full lg:min-h-[420px]"
          />
        </div>
      </section>

      <section className="bg-brand-shell">
        <div className="section-shell py-16">
          <p className="eyebrow">The neighbourhood</p>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-brand-cocoa/80">{page.neighbourhood}</p>
        </div>
      </section>

      <section className="section-shell py-16">
        <div className="flex items-end justify-between gap-6">
          <h2 className="font-display text-3xl font-light tracking-tightest text-brand-cocoa">What we cook in {loc.shortName}</h2>
          <Link to="/menu" className="font-mono text-[11px] uppercase tracking-widest2 text-brand-cocoa/60 hover:text-brand-clay">Full menu &rarr;</Link>
        </div>
        <ul className="mt-8 grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2">
          {signatureDishes.map((d) => (
            <li key={d} className="border-t border-brand-cocoa/15 pt-4">
              <p className="font-display text-xl text-brand-cocoa">{d}</p>
              <p className="mt-1 text-sm leading-relaxed text-brand-cocoa/65">{dishDescriptions[d]}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-brand-cocoa/5">
        <div className="section-shell flex flex-col items-start justify-between gap-6 py-12 sm:flex-row sm:items-center">
          <p className="text-brand-cocoa/80">
            Also in <Link to={`/${other.id}`} className="border-b border-brand-cocoa pb-0.5 text-brand-cocoa">{other.shortName}</Link> — {other.address}
          </p>
          <Link to="/reserve" className="primary-btn">Book {loc.shortName}</Link>
        </div>
      </section>
    </SiteFrame>
  );
}
