import { useState, useEffect } from 'react';
import { buildMapUrl, buildRestaurantSchema } from '@/lib/schema';
import { signatureDishes, menuGroups } from '@/data/restaurant';
import { agrobesoSupabase as supabase } from '../integrations/supabase/agrobeso-client';

const navItems = [
  { label: 'Menu', href: '#menu' },
  { label: 'Locations', href: '#locations' },
  { label: 'Heritage', href: '#about' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Reserve', href: '#ordering' }
];


const dishStories: Record<string, { story: string; note: string }> = {
    'Jollof Rice': { story: 'Long-grain rice slow-simmered in tomato, scotch bonnet and bay until each grain is its own quiet event.', note: 'A dish of celebration' },
    'Waakye': { story: 'Rice and beans cooked with sorghum leaves for that deep, unmistakable hue. Served with shito and fried plantain.', note: 'A Saturday morning ritual' },
    'Kenkey & Fish': { story: 'Fermented corn dough wrapped and steamed, paired with grilled tilapia, fresh pepper and shito.', note: 'Coastal, warm, complete' },
    'Banku & Okra Stew': { story: 'Smooth, sour banku alongside an okra stew braised low with smoked fish and spice.', note: 'Eaten with the right hand' },
    'Peanut Soup': { story: 'Groundnut paste, tomato, ginger and slow-cooked goat — the cold-evening cure.', note: 'Nkate nkwan' },
    'Fufu / Pounded Yam': { story: 'Cassava and plantain pounded to a soft, elastic round. The vehicle, the comfort, the centre.', note: 'Pounded fresh' },
    'Fried Fish / Tilapia': { story: 'Whole tilapia scored, marinated and fried until the skin sings. Served with banku or kenkey.', note: 'Crisp, smoky, bright' },
    'Tuo Zaafi': { story: 'A northern Ghanaian staple of soft millet or maize meal with a leafy green sauce.', note: 'From the north' }
};

const defaultContent: Record<string, string> = {
    hero_tagline: 'Est. South London · Ghanaian Kitchen',
    hero_headline_line1: 'The taste',
    hero_headline_line2: 'of home,',
    hero_headline_italic: 'plated.',
    hero_subheadline: 'Home-style dishes, bold flavours, generous portions, and warm hospitality from Peckham to Thornton Heath.',
    hero_featured_dish: 'Jollof, the way grandmothers taught.',
    manifesto_text: 'Agrobeso is a love letter to West African cooking — written in jollof, peanut soup, grilled tilapia and slow stews. Two kitchens, one table, generous as a Sunday afternoon.',
    menu_headline: 'A short list, cooked properly.',
    menu_subtext: 'Each dish is a chapter. The full menu lives in our kitchens — call ahead for daily specials.',
    menu_footer_note: 'Prices vary by season and branch. Please call ahead for current pricing and availability.',
    heritage_headline: 'Of the pot, the fire, and the people around it.',
    heritage_paragraph1: 'Ghanaian cooking is patient. It rewards time with depth. Our kitchen honours that — slow stews, hand-pounded fufu, fish grilled the moment you order.',
    heritage_paragraph2: 'From rich soups and stews to perfectly seasoned rice dishes and grilled fish, our menu is inspired by home cooking traditions and the hospitality that defines a West African table.',
    locations_headline: 'South of the river.',
    locations_subtext: 'Find us in Peckham and Thornton Heath — same kitchen philosophy, two neighbourhoods.',
    peckham_address: '139 Peckham High St, London SE15 5SL',
    peckham_phone_label: 'Phone to be confirmed',
    peckham_phone_href: '#',
    peckham_hours: 'Opening hours: Please call to confirm',
    thorntonheath_address: '23 Brigstock Rd, Thornton Heath CR7 7JJ',
    thorntonheath_phone_label: '+44 20 8684 6699',
    thorntonheath_phone_href: 'tel:+442086846699',
    thorntonheath_hours: 'Opening hours: Please call to confirm',
    gallery_headline: 'A few moments.',
    gallery_subtext: 'Photography in progress. Replace these tiles with your shoot.',
    ordering_headline: 'Come and eat.',
    ordering_subtext: 'Walk in, call ahead for takeaway, or send a note for catering and group orders. We keep things uncomplicated.',
    contact_headline: 'A private table?',
    contact_subtext: 'For catering, group bookings and weekend specials, leave us a note. We respond within a day.',
    footer_tagline: 'Authentic Ghanaian & West African cooking, plated in South London.',
    instagram_url: '#',
};

export const HomePage = () => {
    const schema = buildRestaurantSchema();
    const [c, setC] = useState<Record<string, string>>(defaultContent);

    useEffect(() => {
          supabase
            .from('site_content')
            .select('id, value')
            .then(({ data }) => {
                      if (data && data.length > 0) {
                                  const map: Record<string, string> = { ...defaultContent };
                                  data.forEach((row: { id: string; value: string }) => { map[row.id] = row.value; });
                                  setC(map);
                      }
            });
    }, []);

    const peckham = { id: 'peckham' as const, shortName: 'Peckham', address: c.peckham_address, phoneLabel: c.peckham_phone_label, phoneHref: c.peckham_phone_href, mapsQuery: c.peckham_address, openingHoursPlaceholder: c.peckham_hours };
    const thorntonHeath = { id: 'thornton-heath' as const, shortName: 'Thornton Heath', address: c.thorntonheath_address, phoneLabel: c.thorntonheath_phone_label, phoneHref: c.thorntonheath_phone_href, mapsQuery: c.thorntonheath_address, openingHoursPlaceholder: c.thorntonheath_hours };
    const locations = [peckham, thorntonHeath];

    return (
          <>
                <header className="sticky top-0 z-50 border-b border-brand-cocoa/10 bg-brand-bone/85 backdrop-blur-md">
                        <div className="section-shell flex items-center justify-between py-5">
                                  <a href="#top" className="font-display text-2xl font-light tracking-tightest text-brand-cocoa">Agrobeso</a>a>
                                  <nav className="hidden items-center gap-10 font-mono text-[11px] uppercase tracking-widest2 text-brand-cocoa/70 md:flex">
                                    {navItems.map((item) => (<a key={item.label} href={item.href} className="transition hover:text-brand-clay">{item.label}</a>a>))}
                                  </nav>nav>
                                  <a href="#ordering" className="hidden font-mono text-[11px] uppercase tracking-widest2 text-brand-cocoa md:inline-flex md:items-center md:gap-2 md:border-b md:border-brand-cocoa md:pb-1">Reserve <span aria-hidden>&rarr;</span>span></a>a>
                        </div>div>
                </header>header>
                <main id="top">
                        <section className="hero-pattern relative overflow-hidden">
                                  <div className="section-shell grid min-h-[88vh] grid-cols-1 items-center gap-16 py-24 lg:grid-cols-12 lg:gap-8">
                                              <div className="lg:col-span-7 reveal">
                                                            <p className="eyebrow mb-10">— {c.hero_tagline}</p>p>
                                                            <h1 className="display text-[clamp(56px,9vw,144px)]">
                                                              {c.hero_headline_line1}<br />{c.hero_headline_line2}<br />
                                                                            <em className="font-display italic text-brand-clay">{c.hero_headline_italic}</em>em>
                                                            </h1>h1>
                                                            <p className="mt-12 max-w-md font-display text-xl italic text-brand-cocoa/70">{c.hero_subheadline}</p>p>
                                                            <div className="mt-12 flex flex-wrap items-center gap-8">
                                                                            <a href="#menu" className="font-mono text-[11px] uppercase tracking-widest2 text-brand-cocoa"><span className="border-b border-brand-cocoa pb-1">View the menu</span>span></a>a>
                                                                            <a href="#ordering" className="font-mono text-[11px] uppercase tracking-widest2 text-brand-cocoa/60 transition hover:text-brand-clay">Reserve a table &rarr;</a>a>
                                                            </div>div>
                                              </div>div>
                                              <div className="lg:col-span-5">
                                                            <div className="canvas-img-dark aspect-[4/5] w-full overflow-hidden">
                                                                            <div className="flex h-full flex-col justify-end p-10 text-brand-bone">
                                                                                              <p className="font-mono text-[10px] uppercase tracking-widest2 text-brand-bone/70">No. 01 / Of the season</p>p>
                                                                                              <p className="mt-4 font-display text-3xl italic">{c.hero_featured_dish}</p>p>
                                                                            </div>div>
                                                            </div>div>
                                              </div>div>
                                  </div>div>
                        </section>section>
                        <section className="border-t border-brand-cocoa/10 bg-brand-shell">
                                  <div className="section-shell grid grid-cols-1 gap-16 py-32 lg:grid-cols-12">
                                              <div className="lg:col-span-3"><p className="eyebrow">— I</p>p><p className="mt-3 font-mono text-[11px] uppercase tracking-widest2 text-brand-cocoa/60">Manifesto</p>p></div>div>
                                              <div className="lg:col-span-8 lg:col-start-5">
                                                            <p className="font-display text-3xl font-light leading-snug text-brand-cocoa sm:text-4xl">{c.manifesto_text}</p>p>
                                              </div>div>
                                  </div>div>
                        </section>section>
                        <section id="menu" className="bg-brand-bone">
                                  <div className="section-shell py-32">
                                              <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
                                                            <div className="lg:col-span-3"><p className="eyebrow">— II</p>p><p className="mt-3 font-mono text-[11px] uppercase tracking-widest2 text-brand-cocoa/60">The Menu</p>p></div>div>
                                                            <div className="lg:col-span-8 lg:col-start-5">
                                                                            <h2 className="display text-5xl sm:text-6xl">{c.menu_headline}</h2>h2>
                                                                            <p className="mt-6 max-w-md font-display text-lg italic text-brand-cocoa/65">{c.menu_subtext}</p>p>
                                                            </div>div>
                                              </div>div>
                                              <div className="mt-24 grid grid-cols-1 gap-x-16 lg:grid-cols-12">
                                                            <div className="lg:col-span-12">
                                                              {signatureDishes.map((dish, i) => {
                              const meta = dishStories[dish] ?? { story: 'Made with care.', note: 'House favourite' };
                              return (
                                                    <article key={dish} className="dish">
                                                                          <span className="dish__no">{String(i + 1).padStart(2, '0')}</span>span>
                                                                          <div><h3 className="dish__name">{dish}</h3>h3><p className="dish__desc">{meta.story}</p>p></div>div>
                                                                          <span className="dish__origin hidden md:block">— {meta.note}</span>span>
                                                    </article>article>
                                                  );
          })}
                                                            </div>div>
                                              </div>div>
                                              <div className="mt-32 grid grid-cols-1 gap-12 border-t border-brand-cocoa/15 pt-16 md:grid-cols-3">
                                                {menuGroups.map((group) => (
                            <div key={group.title}>
                                              <p className="eyebrow">{group.title}</p>p>
                                              <ul className="mt-4 space-y-2 font-display text-lg text-brand-cocoa/80">{group.items.map((item) => (<li key={item}>{item}</li>li>))}</ul>ul>
                            </div>div>
                          ))}
                                              </div>div>
                                              <p className="mt-16 max-w-lg font-display text-sm italic text-brand-cocoa/55">{c.menu_footer_note}</p>p>
                                  </div>div>
                        </section>section>
                        <section id="about" className="border-t border-brand-cocoa/10 bg-brand-cocoa text-brand-bone">
                                  <div className="section-shell grid grid-cols-1 gap-16 py-32 lg:grid-cols-12">
                                              <div className="lg:col-span-3">
                                                            <p className="font-mono text-[11px] uppercase tracking-widest2 text-brand-ochre">— III</p>p>
                                                            <p className="mt-3 font-mono text-[11px] uppercase tracking-widest2 text-brand-bone/50">Heritage</p>p>
                                              </div>div>
                                              <div className="lg:col-span-8 lg:col-start-5">
                                                            <h2 className="font-display text-5xl font-light tracking-tightest sm:text-6xl">{c.heritage_headline}</h2>h2>
                                                            <p className="mt-10 max-w-2xl font-display text-xl italic text-brand-bone/75">{c.heritage_paragraph1}</p>p>
                                                            <p className="mt-8 max-w-xl text-[15px] leading-relaxed text-brand-bone/60">{c.heritage_paragraph2}</p>p>
                                              </div>div>
                                  </div>div>
                        </section>section>
                        <section id="locations" className="bg-brand-bone">
                                  <div className="section-shell py-32">
                                              <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
                                                            <div className="lg:col-span-3"><p className="eyebrow">— IV</p>p><p className="mt-3 font-mono text-[11px] uppercase tracking-widest2 text-brand-cocoa/60">Two Tables</p>p></div>div>
                                                            <div className="lg:col-span-8 lg:col-start-5">
                                                                            <h2 className="display text-5xl sm:text-6xl">{c.locations_headline}</h2>h2>
                                                                            <p className="mt-6 max-w-md font-display text-lg italic text-brand-cocoa/65">{c.locations_subtext}</p>p>
                                                            </div>div>
                                              </div>div>
                                              <div className="mt-20 grid grid-cols-1 gap-px bg-brand-cocoa/15 md:grid-cols-2">
                                                {locations.map((location, i) => (
                            <article key={location.id} className="bg-brand-bone p-10 sm:p-14">
                                              <p className="font-mono text-[11px] uppercase tracking-widest2 text-brand-clay">{String(i + 1).padStart(2, '0')} / {location.shortName}</p>p>
                                              <h3 className="mt-6 font-display text-4xl font-light tracking-tightest text-brand-cocoa sm:text-5xl">{location.shortName}</h3>h3>
                                              <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-brand-cocoa/70">{location.address}</p>p>
                                              <p className="mt-4 font-display text-sm italic text-brand-cocoa/50">{location.openingHoursPlaceholder}</p>p>
                                              <div className="mt-10 flex flex-wrap gap-6 font-mono text-[11px] uppercase tracking-widest2">
                                                                  <a href={buildMapUrl(location.mapsQuery)} target="_blank" rel="noreferrer" className="border-b border-brand-cocoa pb-1 text-brand-cocoa transition hover:text-brand-clay">Directions &rarr;</a>a>
                                                                  <a href={location.phoneHref} className="border-b border-brand-cocoa/30 pb-1 text-brand-cocoa/70 transition hover:border-brand-cocoa hover:text-brand-cocoa">Call</a>a>
                                              </div>div>
                            </article>article>
                          ))}
                                              </div>div>
                                  </div>div>
                        </section>section>
                        <section id="gallery" className="border-t border-brand-cocoa/10 bg-brand-shell">
                                  <div className="section-shell py-32">
                                              <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
                                                            <div className="lg:col-span-3"><p className="eyebrow">— V</p>p><p className="mt-3 font-mono text-[11px] uppercase tracking-widest2 text-brand-cocoa/60">In the Kitchen</p>p></div>div>
                                                            <div className="lg:col-span-8 lg:col-start-5">
                                                                            <h2 className="display text-5xl sm:text-6xl">{c.gallery_headline}</h2>h2>
                                                                            <p className="mt-6 max-w-md font-display text-lg italic text-brand-cocoa/65">{c.gallery_subtext}</p>p>
                                                            </div>div>
                                              </div>div>
                                              <div className="mt-20 grid grid-cols-12 gap-6">
                                                            <div className="canvas-img col-span-12 aspect-[3/2] md:col-span-7" />
                                                            <div className="canvas-img-dark col-span-12 aspect-[3/2] md:col-span-5" />
                                                            <div className="canvas-img-dark col-span-6 aspect-square md:col-span-4" />
                                                            <div className="canvas-img col-span-6 aspect-square md:col-span-4" />
                                                            <div className="canvas-img col-span-12 aspect-[3/2] md:col-span-4" />
                                              </div>div>
                                  </div>div>
                        </section>section>
                        <section id="ordering" className="border-t border-brand-cocoa/10 bg-brand-bone">
                                  <div className="section-shell py-32 text-center">
                                              <p className="eyebrow">— VI / The invitation</p>p>
                                              <h2 className="display mt-8 text-5xl sm:text-7xl">{c.ordering_headline}</h2>h2>
                                              <p className="mx-auto mt-8 max-w-xl font-display text-xl italic text-brand-cocoa/70">{c.ordering_subtext}</p>p>
                                              <div className="mx-auto mt-16 flex max-w-2xl flex-wrap items-center justify-center gap-8 font-mono text-[11px] uppercase tracking-widest2">
                                                            <a href={peckham.phoneHref} className="border-b border-brand-cocoa pb-1 text-brand-cocoa transition hover:text-brand-clay">Call Peckham &rarr;</a>a>
                                                            <a href={thorntonHeath.phoneHref} className="border-b border-brand-cocoa pb-1 text-brand-cocoa transition hover:text-brand-clay">Call Thornton Heath &rarr;</a>a>
                                                            <a href={buildMapUrl(thorntonHeath.mapsQuery)} target="_blank" rel="noreferrer" className="border-b border-brand-cocoa/30 pb-1 text-brand-cocoa/70 transition hover:border-brand-cocoa hover:text-brand-cocoa">Directions</a>a>
                                              </div>div>
                                  </div>div>
                        </section>section>
                        <section id="contact" className="border-t border-brand-cocoa/10 bg-brand-shell">
                                  <div className="section-shell grid grid-cols-1 gap-20 py-32 lg:grid-cols-12">
                                              <div className="lg:col-span-5">
                                                            <p className="eyebrow">— VII</p>p>
                                                            <h2 className="display mt-6 text-4xl sm:text-5xl">{c.contact_headline}</h2>h2>
                                                            <p className="mt-6 max-w-sm font-display text-lg italic text-brand-cocoa/65">{c.contact_subtext}</p>p>
                                                            <div className="mt-12 space-y-5 text-[15px] text-brand-cocoa/80">
                                                              {locations.map((location) => (
                              <div key={location.id}>
                                                  <p className="font-mono text-[10px] uppercase tracking-widest2 text-brand-cocoa/50">{location.shortName}</p>p>
                                                  <a href={location.phoneHref} className="mt-1 block font-display text-2xl text-brand-cocoa transition hover:text-brand-clay">{location.phoneLabel}</a>a>
                              </div>div>
                            ))}
                                                            </div>div>
                                              </div>div>
                                              <form className="space-y-2 lg:col-span-6 lg:col-start-7">
                                                            <label className="block"><span className="font-mono text-[10px] uppercase tracking-widest2 text-brand-cocoa/50">Name</span>span><input className="form-input" type="text" name="name" placeholder="Your name" /></label>label>
                                                            <label className="block pt-4"><span className="font-mono text-[10px] uppercase tracking-widest2 text-brand-cocoa/50">Phone</span>span><input className="form-input" type="tel" name="phone" placeholder="+44" /></label>label>
                                                            <label className="block pt-4"><span className="font-mono text-[10px] uppercase tracking-widest2 text-brand-cocoa/50">Email</span>span><input className="form-input" type="email" name="email" placeholder="you@email.com" /></label>label>
                                                            <label className="block pt-4"><span className="font-mono text-[10px] uppercase tracking-widest2 text-brand-cocoa/50">Event date</span>span><input className="form-input" type="text" name="event-date" placeholder="When?" /></label>label>
                                                            <label className="block pt-4"><span className="font-mono text-[10px] uppercase tracking-widest2 text-brand-cocoa/50">Tell us more</span>span><textarea className="form-input min-h-32" name="message" placeholder="Number of guests, preferred dishes, anything else." /></label>label>
                                                            <button type="button" className="primary-btn mt-10 w-full justify-center">Send enquiry &rarr;</button>button>
                                              </form>form>
                                  </div>div>
                        </section>section>
                        <footer className="bg-brand-cocoa text-brand-bone">
                                  <div className="section-shell grid grid-cols-1 gap-12 py-20 md:grid-cols-12">
                                              <div className="md:col-span-5">
                                                            <p className="font-display text-4xl font-light tracking-tightest">Agrobeso</p>p>
                                                            <p className="mt-4 max-w-xs font-display text-sm italic text-brand-bone/60">{c.footer_tagline}</p>p>
                                              </div>div>
                                              <div className="md:col-span-3">
                                                            <p className="font-mono text-[10px] uppercase tracking-widest2 text-brand-bone/50">Visit</p>p>
                                                            <ul className="mt-4 space-y-2 text-sm text-brand-bone/80">{locations.map((l) => (<li key={l.id}>{l.shortName}</li>li>))}</ul>ul>
                                              </div>div>
                                              <div className="md:col-span-2">
                                                            <p className="font-mono text-[10px] uppercase tracking-widest2 text-brand-bone/50">Index</p>p>
                                                            <ul className="mt-4 space-y-2 font-mono text-[11px] uppercase tracking-widest2 text-brand-bone/80">{navItems.map((n) => (<li key={n.label}><a href={n.href} className="hover:text-brand-ochre">{n.label}</a>a></li>li>))}</ul>ul>
                                              </div>div>
                                              <div className="md:col-span-2">
                                                            <p className="font-mono text-[10px] uppercase tracking-widest2 text-brand-bone/50">Follow</p>p>
                                                            <ul className="mt-4 space-y-2 font-mono text-[11px] uppercase tracking-widest2 text-brand-bone/80"><li><a href={c.instagram_url} className="hover:text-brand-ochre">Instagram</a>a></li>li></ul>ul>
                                              </div>div>
                                  </div>div>
                                  <div className="section-shell border-t border-brand-bone/10 py-8 font-mono text-[10px] uppercase tracking-widest2 text-brand-bone/40">&copy; {new Date().getFullYear()} Agrobeso &middot; South London</div>div>
                        </footer>footer>
                </main>main>
                <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-brand-cocoa/10 bg-brand-bone/95 p-2 backdrop-blur md:hidden">
                        <ul className="grid grid-cols-4 gap-2">
                                  <li><a href="#menu" className="sticky-nav-btn">Menu</a>a></li>li>
                                  <li><a href={thorntonHeath.phoneHref} className="sticky-nav-btn">Call</a>a></li>li>
                                  <li><a href={buildMapUrl(thorntonHeath.mapsQuery)} target="_blank" rel="noreferrer" className="sticky-nav-btn">Map</a>a></li>li>
                                  <li><a href="#ordering" className="sticky-nav-btn">Reserve</a>a></li>li>
                        </ul>ul>
                </nav>nav>
                <script type="application/ld+json">{JSON.stringify(schema)}</script>script>
          </>>
        );
};</>
