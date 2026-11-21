import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SiteFrame } from '@/components/SiteFrame';
import { menuGroups, signatureDishes, dishDescriptions, locations } from '@/data/restaurant';
import { applyPageSeo } from '@/lib/seo';
import { injectJsonLd } from '@/lib/jsonld';
import { agrobesoSupabase as supabase } from '../integrations/supabase/agrobeso-client';

const SITE = 'https://www.agrobeso.org';

type LiveCategory = { id: string; title: string; priceNote: string | null; items: Array<{ name: string; price?: string }> };

export default function MenuPage() {
  const [live, setLive] = useState<LiveCategory[]>([]);

  useEffect(() => {
    const cleanupSeo = applyPageSeo({
      title: 'Menu | Agrobeso – Ghanaian & West African Food, Peckham & Thornton Heath',
      description:
        'The Agrobeso menu: jollof rice, waakye, kenkey & fried fish, banku & okra stew, peanut soup, fufu, pounded yam, grilled tilapia, puff puff and more. Ghanaian food in South London.',
      path: '/menu',
    });
    const cleanupLd = injectJsonLd('ld-menu', {
      '@context': 'https://schema.org',
      '@type': 'Menu',
      '@id': `${SITE}/menu#menu`,
      name: 'Agrobeso Menu',
      url: `${SITE}/menu`,
      inLanguage: 'en-GB',
      hasMenuSection: menuGroups.map((g) => ({
        '@type': 'MenuSection',
        name: g.title,
        hasMenuItem: g.items.map((name) => ({ '@type': 'MenuItem', name })),
      })),
    });
    window.scrollTo(0, 0);
    supabase.from('site_content').select('id, value').eq('id', 'menu_full__categories').single()
      .then(({ data }) => {
        if (data?.value) { try { setLive(JSON.parse(data.value)); } catch { /* ignore */ } }
      });
    return () => { cleanupSeo(); cleanupLd(); };
  }, []);

  return (
    <SiteFrame>
      <section className="hero-pattern">
        <div className="section-shell py-16 lg:py-24">
          <p className="eyebrow">Agrobeso · Menu</p>
          <h1 className="display mt-4 text-4xl sm:text-6xl">Ghanaian &amp; West African food, cooked properly.</h1>
          <p className="dek mt-6 max-w-2xl">
            The same menu in Peckham and Thornton Heath. Prices vary by branch and season — call ahead for daily specials and current pricing.
          </p>
        </div>
      </section>

      <section className="section-shell py-16">
        <h2 className="font-display text-3xl font-light tracking-tightest text-brand-cocoa">Signature dishes</h2>
        <ul className="mt-8 grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2">
          {signatureDishes.map((d, i) => (
            <li key={d} className="border-t border-brand-cocoa/15 pt-4">
              <p className="dish__no">No. {String(i + 1).padStart(2, '0')}</p>
              <p className="mt-1 font-display text-2xl text-brand-cocoa">{d}</p>
              <p className="mt-2 text-sm leading-relaxed text-brand-cocoa/65">{dishDescriptions[d]}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-brand-shell">
        <div className="section-shell py-16">
          <h2 className="font-display text-3xl font-light tracking-tightest text-brand-cocoa">Full menu</h2>
          <div className="mt-8 grid grid-cols-1 gap-12 md:grid-cols-2">
            {(live.length > 0 ? live : menuGroups.map((g): LiveCategory => ({ id: g.title, title: g.title, priceNote: null, items: g.items.map((name) => ({ name })) }))).map((g) => (
              <div key={g.id}>
                <h3 className="font-mono text-[11px] uppercase tracking-widest2 text-brand-clay">{g.title}</h3>
                {g.priceNote && <p className="mt-1 text-xs text-brand-cocoa/50">{g.priceNote}</p>}
                <ul className="mt-4 divide-y divide-brand-cocoa/10">
                  {g.items.map((it) => (
                    <li key={it.name} className="flex items-baseline justify-between gap-4 py-2 text-brand-cocoa/85">
                      <span>{it.name}</span>
                      {it.price && <span className="font-mono text-xs text-brand-cocoa/60">{it.price}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell flex flex-col items-start justify-between gap-6 py-12 sm:flex-row sm:items-center">
        <p className="text-brand-cocoa/80">
          Eat with us in {locations.map((l, i) => (
            <span key={l.id}>
              <Link to={`/${l.id}`} className="border-b border-brand-cocoa pb-0.5 text-brand-cocoa">{l.shortName}</Link>
              {i < locations.length - 1 ? ' or ' : ''}
            </span>
          ))}.
        </p>
        <Link to="/reserve" className="primary-btn">Reserve a table</Link>
      </section>
    </SiteFrame>
  );
}
