import { useState, useEffect, useCallback } from 'react';
import { buildMapUrl, buildRestaurantSchema } from '@/lib/schema';
import { heroContent, locations, menuGroups, signatureDishes } from '@/data/restaurant';
import { supabase, STORAGE_URL } from '@/lib/supabase';

const navItems = [
  { label: 'Menu', href: '#menu' },
  { label: 'Locations', href: '#locations' },
  { label: 'Heritage', href: '#about' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Reserve', href: '#ordering' }
];

const peckham = locations[0];
const thorntonHeath = locations[1];

const dishStories: Record<string, { story: string; note: string }> = {
  'Jollof Rice': {
    story: 'Long-grain rice slow-simmered in tomato, scotch bonnet and bay until each grain is its own quiet event.',
    note: 'A dish of celebration'
  },
  'Waakye': {
    story: 'Rice and beans cooked with sorghum leaves for that deep, unmistakable hue. Served with shito and fried plantain.',
    note: 'A Saturday morning ritual'
  },
  'Kenkey & Fish': {
    story: 'Fermented corn dough wrapped and steamed, paired with grilled tilapia, fresh pepper and shito.',
    note: 'Coastal, warm, complete'
  },
  'Banku & Okra Stew': {
    story: 'Smooth, sour banku alongside an okra stew braised low with smoked fish and spice.',
    note: 'Eaten with the right hand'
  },
  'Peanut Soup': {
    story: 'Groundnut paste, tomato, ginger and slow-cooked goat — the cold-evening cure.',
    note: 'Nkate nkwan'
  },
  'Fufu / Pounded Yam': {
    story: 'Cassava and plantain pounded to a soft, elastic round. The vehicle, the comfort, the centre.',
    note: 'Pounded fresh'
  },
  'Fried Fish / Tilapia': {
    story: 'Whole tilapia scored, marinated and fried until the skin sings. Served with banku or kenkey.',
    note: 'Crisp, smoky, bright'
  },
  'Tuo Zaafi': {
    story: 'A northern Ghanaian staple of soft millet or maize meal with a leafy green sauce.',
    note: 'From the north'
  }
};

const dishSlugMap: Record<string, string> = {
  'Jollof Rice': 'jollof_rice',
  'Waakye': 'waakye',
  'Kenkey & Fish': 'kenkey_fish',
  'Banku & Okra Stew': 'banku_okra',
  'Peanut Soup': 'peanut_soup',
  'Fufu / Pounded Yam': 'fufu',
  'Fried Fish / Tilapia': 'fried_fish',
  'Tuo Zaafi': 'tuo_zaafi',
};

// ── Lightbox ────────────────────────────────────────────────────────────────
interface LightboxProps {
  src: string;
  alt: string;
  onClose: () => void;
}

const Lightbox = ({ src, alt, onClose }: LightboxProps) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.88)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'zoom-out',
      }}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        style={{
          position: 'absolute', top: '1.25rem', right: '1.5rem',
          background: 'none', border: 'none', color: '#fff',
          fontSize: '2rem', lineHeight: 1, cursor: 'pointer',
          opacity: 0.75, padding: '0.25rem 0.5rem',
        }}
      >
        &times;
      </button>
      <img
        src={src}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '90vw', maxHeight: '88vh',
          objectFit: 'contain', borderRadius: '6px',
          boxShadow: '0 8px 48px rgba(0,0,0,0.6)',
          cursor: 'default',
        }}
      />
    </div>
  );
};

// ── HomePage ─────────────────────────────────────────────────────────────────
export const HomePage = () => {
  const schema = buildRestaurantSchema();
  const [dishImgs, setDishImgs] = useState<Record<string, string>>({});
  const [galleryImgs, setGalleryImgs] = useState<string[]>([]);
  const [heroImg, setHeroImg] = useState<string>('');
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  const openLightbox = useCallback((src: string, alt: string) => {
    setLightbox({ src, alt });
  }, []);

  const closeLightbox = useCallback(() => setLightbox(null), []);

  useEffect(() => {
    supabase.storage.from('images').list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } })
      .then(({ data }) => {
        if (!data) return;
        const dishMap: Record<string, string> = {};
        const galleryFiles: string[] = [];
        let hero = '';

        data.forEach((f: any) => {
          if (!f.name || f.name === '.emptyFolderPlaceholder') return;
          const url = STORAGE_URL + '/' + f.name;
          if (f.name.startsWith('hero-')) {
            if (!hero) hero = url;
          } else if (f.name.startsWith('gallery-')) {
            galleryFiles.push(url);
          } else if (f.name.startsWith('dish-')) {
            const slug = f.name.replace(/^dish-/, '').replace(/-\d+\.\w+$/, '');
            dishMap[slug] = url;
          }
        });

        setDishImgs(dishMap);
        setGalleryImgs(galleryFiles);
        if (hero) setHeroImg(hero);
      });
  }, []);

  return (
    <>
      {lightbox && <Lightbox src={lightbox.src} alt={lightbox.alt} onClose={closeLightbox} />}

      <header className="sticky top-0 z-50 border-b border-brand-cocoa/10 bg-brand-bone/85 backdrop-blur-md">
        <div className="section-shell flex items-center justify-between py-5">
          <a href="#top" className="font-display text-2xl font-light tracking-tightest text-brand-cocoa">
            Agrobeso
          </a>
          <nav className="hidden items-center gap-10 font-mono text-[11px] uppercase tracking-widest2 text-brand-cocoa/70 md:flex">
            {navItems.map((item) => (
              <a key={item.label} href={item.href} className="transition hover:text-brand-clay">
                {item.label}
              </a>
            ))}
          </nav>
          <a href="#ordering" className="hidden font-mono text-[11px] uppercase tracking-widest2 text-brand-cocoa md:inline-flex md:items-center md:gap-2 md:border-b md:border-brand-cocoa md:pb-1">
            Reserve <span aria-hidden>&rarr;</span>
          </a>
        </div>
      </header>

      <main id="top">
        <section className="hero-pattern relative overflow-hidden">
          <div className="section-shell grid min-h-[88vh] grid-cols-1 items-center gap-16 py-24 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-7 reveal">
              <p className="eyebrow">&mdash; Est. South London &middot; Ghanaian Kitchen</p>
              <h1 className="display text-[clamp(56px,9vw,144px)]">
                The taste<br />
                of home,<br />
                <em className="font-display italic text-brand-clay">plated.</em>
              </h1>
              <p className="mt-12 max-w-md font-display text-xl italic text-brand-cocoa/70">
                {heroContent.subheadline}
              </p>
              <div className="mt-12 flex flex-wrap items-center gap-8">
                <a href="#menu" className="font-mono text-[11px] uppercase tracking-widest2 text-brand-cocoa">
                  <span className="border-b border-brand-cocoa pb-1">View the menu</span>
                </a>
                <a href="#ordering" className="font-mono text-[11px] uppercase tracking-widest2 text-brand-cocoa/60 transition hover:text-brand-clay">
                  Reserve a table &rarr;
                </a>
              </div>
            </div>

            <div className="lg:col-span-5">
              {heroImg ? (
                <div
                  className="aspect-[4/5] w-full overflow-hidden relative cursor-zoom-in"
                  onClick={() => openLightbox(heroImg, 'Agrobeso featured dish')}
                  title="Click to expand"
                >
                  <img src={heroImg} alt="Agrobeso featured dish" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-10 text-brand-bone">
                    <p className="font-mono text-[10px] uppercase tracking-widest2 text-brand-bone/70">No. 01 / Of the season</p>
                    <p className="mt-4 font-display text-3xl italic">Jollof, the way grandmothers taught.</p>
                  </div>
                </div>
              ) : (
                <div className="canvas-img-dark aspect-[4/5] w-full overflow-hidden">
                  <div className="flex h-full flex-col justify-end p-10 text-brand-bone">
                    <p className="font-mono text-[10px] uppercase tracking-widest2 text-brand-bone/70">No. 01 / Of the season</p>
                    <p className="mt-4 font-display text-3xl italic">Jollof, the way grandmothers taught.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="border-t border-brand-cocoa/10 bg-brand-shell">
          <div className="section-shell grid grid-cols-1 gap-16 py-32 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <p className="eyebrow">&mdash; I</p>
              <p className="mt-3 font-mono text-[11px] uppercase tracking-widest2 text-brand-cocoa/60">Manifesto</p>
            </div>
            <div className="lg:col-span-8 lg:col-start-5">
              <p className="font-display text-3xl font-light leading-snug text-brand-cocoa sm:text-4xl">
                Agrobeso is a love letter to West African cooking &mdash; written in jollof, peanut soup,
                grilled tilapia and slow stews. Two kitchens, one table, generous as a Sunday afternoon.
              </p>
            </div>
          </div>
        </section>

        <section id="menu" className="bg-brand-bone">
          <div className="section-shell py-32">
            <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
              <div className="lg:col-span-3">
                <p className="eyebrow">&mdash; II</p>
                <p className="mt-3 font-mono text-[11px] uppercase tracking-widest2 text-brand-cocoa/60">The Menu</p>
              </div>
              <div className="lg:col-span-8 lg:col-start-5">
                <h2 className="display text-5xl sm:text-6xl">A short list, cooked properly.</h2>
                <p className="mt-6 max-w-md font-display text-lg italic text-brand-cocoa/65">
                  Each dish is a chapter. The full menu lives in our kitchens &mdash; call ahead for daily specials.
                </p>
              </div>
            </div>

            <div className="mt-24 grid grid-cols-1 gap-x-16 lg:grid-cols-12">
              <div className="lg:col-span-12">
                {signatureDishes.map((dish, i) => {
                  const meta = dishStories[dish] ?? { story: 'Made with care, balanced spice and generous portions.', note: 'House favourite' };
                  const slug = dishSlugMap[dish];
                  const imgUrl = slug ? dishImgs[slug] : undefined;
                  return (
                    <article key={dish} className="dish">
                      <span className="dish__no">{String(i + 1).padStart(2, '0')}</span>
                      <div className="flex items-start gap-6">
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={dish}
                            onClick={() => openLightbox(imgUrl, dish)}
                            title="Click to expand"
                            style={{
                              width: '168px', height: '168px',
                              objectFit: 'cover', borderRadius: '8px',
                              flexShrink: 0, cursor: 'zoom-in',
                              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.03)';
                              (e.currentTarget as HTMLImageElement).style.boxShadow = '0 6px 24px rgba(0,0,0,0.18)';
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)';
                              (e.currentTarget as HTMLImageElement).style.boxShadow = 'none';
                            }}
                          />
                        ) : (
                          <div style={{ width: '168px', height: '168px', borderRadius: '8px', flexShrink: 0, background: '#e8e2d9' }} />
                        )}
                        <div>
                          <h3 className="dish__name">{dish}</h3>
                          <p className="dish__desc">{meta.story}</p>
                        </div>
                      </div>
                      <span className="dish__origin hidden md:block">&mdash; {meta.note}</span>
                    </article>
                  );
                })}
              </div>
            </div>

            <div className="mt-32 grid grid-cols-1 gap-12 border-t border-brand-cocoa/15 pt-16 md:grid-cols-3">
              {menuGroups.map((group) => (
                <div key={group.title}>
                  <p className="eyebrow">{group.title}</p>
                  <ul className="mt-4 space-y-2 font-display text-lg text-brand-cocoa/80">
                    {group.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <p className="mt-16 max-w-lg font-display text-sm italic text-brand-cocoa/55">
              Prices vary by season and branch. Please call ahead for current pricing and availability.
            </p>
          </div>
        </section>

        <section id="about" className="border-t border-brand-cocoa/10 bg-brand-cocoa text-brand-bone">
          <div className="section-shell grid grid-cols-1 gap-16 py-32 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <p className="font-mono text-[11px] uppercase tracking-widest2 text-brand-ochre">&mdash; III</p>
              <p className="mt-3 font-mono text-[11px] uppercase tracking-widest2 text-brand-bone/50">Heritage</p>
            </div>
            <div className="lg:col-span-8 lg:col-start-5">
              <h2 className="font-display text-5xl font-light tracking-tightest sm:text-6xl">
                Of the pot, the fire,<br />and the people around it.
              </h2>
              <p className="mt-10 max-w-2xl font-display text-xl italic text-brand-bone/75">
                Ghanaian cooking is patient. It rewards time with depth. Our kitchen honours
                that &mdash; slow stews, hand-pounded fufu, fish grilled the moment you order.
              </p>
              <p className="mt-8 max-w-xl text-[15px] leading-relaxed text-brand-bone/60">
                From rich soups and stews to perfectly seasoned rice dishes and grilled fish,
                our menu is inspired by home cooking traditions and the hospitality that defines
                a West African table.
              </p>
            </div>
          </div>
        </section>

        <section id="locations" className="bg-brand-bone">
          <div className="section-shell py-32">
            <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
              <div className="lg:col-span-3">
                <p className="eyebrow">&mdash; IV</p>
                <p className="mt-3 font-mono text-[11px] uppercase tracking-widest2 text-brand-cocoa/60">Two Tables</p>
              </div>
              <div className="lg:col-span-8 lg:col-start-5">
                <h2 className="display text-5xl sm:text-6xl">South of the river.</h2>
                <p className="mt-6 max-w-md font-display text-lg italic text-brand-cocoa/65">
                  Find us in Peckham and Thornton Heath &mdash; same kitchen philosophy, two neighbourhoods.
                </p>
              </div>
            </div>

            <div className="mt-20 grid grid-cols-1 gap-px bg-brand-cocoa/15 md:grid-cols-2">
              {locations.map((location, i) => (
                <article key={location.id} className="bg-brand-bone p-10 sm:p-14">
                  <div className="flex items-baseline justify-between">
                    <p className="font-mono text-[11px] uppercase tracking-widest2 text-brand-clay">
                      {String(i + 1).padStart(2, '0')} / {location.shortName}
                    </p>
                  </div>
                  <h3 className="mt-6 font-display text-4xl font-light tracking-tightest text-brand-cocoa sm:text-5xl">
                    {location.shortName}
                  </h3>
                  <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-brand-cocoa/70">
                    {location.address}
                  </p>
                  <p className="mt-4 font-display text-sm italic text-brand-cocoa/50">
                    {location.openingHoursPlaceholder}
                  </p>
                  <div className="mt-10 flex flex-wrap gap-6 font-mono text-[11px] uppercase tracking-widest2">
                    <a href={buildMapUrl(location.mapsQuery)} target="_blank" rel="noreferrer" className="border-b border-brand-cocoa pb-1 text-brand-cocoa transition hover:text-brand-clay">
                      Directions &rarr;
                    </a>
                    <a href={location.phoneHref} className="border-b border-brand-cocoa/30 pb-1 text-brand-cocoa/70 transition hover:border-brand-cocoa hover:text-brand-cocoa">
                      Call
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="gallery" className="border-t border-brand-cocoa/10 bg-brand-shell">
          <div className="section-shell py-32">
            <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
              <div className="lg:col-span-3">
                <p className="eyebrow">&mdash; V</p>
                <p className="mt-3 font-mono text-[11px] uppercase tracking-widest2 text-brand-cocoa/60">In the Kitchen</p>
              </div>
              <div className="lg:col-span-8 lg:col-start-5">
                <h2 className="display text-5xl sm:text-6xl">A few moments.</h2>
                <p className="mt-6 max-w-md font-display text-lg italic text-brand-cocoa/65">
                  Photography in progress. Replace these tiles with your shoot.
                </p>
              </div>
            </div>

            <div className="mt-20 grid grid-cols-12 gap-6">
              {galleryImgs.length > 0 ? (
                <>
                  <div
                    className="col-span-12 aspect-[3/2] md:col-span-7 overflow-hidden cursor-zoom-in"
                    onClick={() => openLightbox(galleryImgs[0], 'Gallery 1')}
                  >
                    <img src={galleryImgs[0]} alt="Gallery 1" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="col-span-12 aspect-[3/2] md:col-span-5 overflow-hidden">
                    {galleryImgs[1] ? (
                      <img
                        src={galleryImgs[1]} alt="Gallery 2"
                        className="w-full h-full object-cover cursor-zoom-in hover:scale-105 transition-transform duration-300"
                        onClick={() => openLightbox(galleryImgs[1], 'Gallery 2')}
                      />
                    ) : <div className="canvas-img-dark w-full h-full" />}
                  </div>
                  <div className="col-span-6 aspect-square md:col-span-4 overflow-hidden">
                    {galleryImgs[2] ? (
                      <img
                        src={galleryImgs[2]} alt="Gallery 3"
                        className="w-full h-full object-cover cursor-zoom-in hover:scale-105 transition-transform duration-300"
                        onClick={() => openLightbox(galleryImgs[2], 'Gallery 3')}
                      />
                    ) : <div className="canvas-img-dark w-full h-full" />}
                  </div>
                  <div className="col-span-6 aspect-square md:col-span-4 overflow-hidden">
                    {galleryImgs[3] ? (
                      <img
                        src={galleryImgs[3]} alt="Gallery 4"
                        className="w-full h-full object-cover cursor-zoom-in hover:scale-105 transition-transform duration-300"
                        onClick={() => openLightbox(galleryImgs[3], 'Gallery 4')}
                      />
                    ) : <div className="canvas-img w-full h-full" />}
                  </div>
                  <div className="col-span-12 aspect-[3/2] md:col-span-4 overflow-hidden">
                    {galleryImgs[4] ? (
                      <img
                        src={galleryImgs[4]} alt="Gallery 5"
                        className="w-full h-full object-cover cursor-zoom-in hover:scale-105 transition-transform duration-300"
                        onClick={() => openLightbox(galleryImgs[4], 'Gallery 5')}
                      />
                    ) : <div className="canvas-img w-full h-full" />}
                  </div>
                </>
              ) : (
                <>
                  <div className="canvas-img col-span-12 aspect-[3/2] md:col-span-7" />
                  <div className="canvas-img-dark col-span-12 aspect-[3/2] md:col-span-5" />
                  <div className="canvas-img-dark col-span-6 aspect-square md:col-span-4" />
                  <div className="canvas-img col-span-6 aspect-square md:col-span-4" />
                  <div className="canvas-img col-span-12 aspect-[3/2] md:col-span-4" />
                </>
              )}
            </div>
          </div>
        </section>

        <section id="ordering" className="border-t border-brand-cocoa/10 bg-brand-bone">
          <div className="section-shell py-32 text-center">
            <p className="eyebrow">&mdash; VI / The invitation</p>
            <h2 className="display mt-8 text-5xl sm:text-7xl">Come and eat.</h2>
            <p className="mx-auto mt-8 max-w-xl font-display text-xl italic text-brand-cocoa/70">
              Walk in, call ahead for takeaway, or send a note for catering and group orders.
              We keep things uncomplicated.
            </p>
            <div className="mx-auto mt-16 flex max-w-2xl flex-wrap items-center justify-center gap-8 font-mono text-[11px] uppercase tracking-widest2">
              <a href={peckham.phoneHref} className="border-b border-brand-cocoa pb-1 text-brand-cocoa transition hover:text-brand-clay">
                Call Peckham &rarr;
              </a>
              <a href={thorntonHeath.phoneHref} className="border-b border-brand-cocoa pb-1 text-brand-cocoa transition hover:text-brand-clay">
                Call Thornton Heath &rarr;
              </a>
              <a href={buildMapUrl(thorntonHeath.mapsQuery)} target="_blank" rel="noreferrer" className="border-b border-brand-cocoa/30 pb-1 text-brand-cocoa/70 transition hover:border-brand-cocoa hover:text-brand-cocoa">
                Directions
              </a>
            </div>
          </div>
        </section>

        <section id="contact" className="border-t border-brand-cocoa/10 bg-brand-shell">
          <div className="section-shell grid grid-cols-1 gap-20 py-32 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="eyebrow">&mdash; VII</p>
              <h2 className="display mt-6 text-4xl sm:text-5xl">A private table?</h2>
              <p className="mt-6 max-w-sm font-display text-lg italic text-brand-cocoa/65">
                For catering, group bookings and weekend specials, leave us a note.
                We respond within a day.
              </p>

              <div className="mt-12 space-y-5 text-[15px] text-brand-cocoa/80">
                {locations.map((location) => (
                  <div key={location.id}>
                    <p className="font-mono text-[10px] uppercase tracking-widest2 text-brand-cocoa/50">
                      {location.shortName}
                    </p>
                    <a href={location.phoneHref} className="mt-1 block font-display text-2xl text-brand-cocoa transition hover:text-brand-clay">
                      {location.phoneLabel}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <form className="space-y-2 lg:col-span-6 lg:col-start-7">
              <label className="block">
                <span className="font-mono text-[10px] uppercase tracking-widest2 text-brand-cocoa/50">Name</span>
                <input className="form-input" type="text" name="name" placeholder="Your name" />
              </label>
              <label className="block pt-4">
                <span className="font-mono text-[10px] uppercase tracking-widest2 text-brand-cocoa/50">Phone</span>
                <input className="form-input" type="tel" name="phone" placeholder="+44" />
              </label>
              <label className="block pt-4">
                <span className="font-mono text-[10px] uppercase tracking-widest2 text-brand-cocoa/50">Email</span>
                <input className="form-input" type="email" name="email" placeholder="you@email.com" />
              </label>
              <label className="block pt-4">
                <span className="font-mono text-[10px] uppercase tracking-widest2 text-brand-cocoa/50">Event date</span>
                <input className="form-input" type="text" name="event-date" placeholder="When?" />
              </label>
              <label className="block pt-4">
                <span className="font-mono text-[10px] uppercase tracking-widest2 text-brand-cocoa/50">Tell us more</span>
                <textarea className="form-input min-h-32" name="message" placeholder="Number of guests, preferred dishes, anything else." />
              </label>
              <button type="button" className="primary-btn mt-10 w-full justify-center">
                Send enquiry &rarr;
              </button>
            </form>
          </div>
        </section>

        <footer className="bg-brand-cocoa text-brand-bone">
          <div className="section-shell grid grid-cols-1 gap-12 py-20 md:grid-cols-12">
            <div className="md:col-span-5">
              <p className="font-display text-4xl font-light tracking-tightest">Agrobeso</p>
              <p className="mt-4 max-w-xs font-display text-sm italic text-brand-bone/60">
                Authentic Ghanaian & West African cooking, plated in South London.
              </p>
            </div>
            <div className="md:col-span-3">
              <p className="font-mono text-[10px] uppercase tracking-widest2 text-brand-bone/50">Visit</p>
              <ul className="mt-4 space-y-2 text-sm text-brand-bone/80">
                {locations.map((l) => (
                  <li key={l.id}>{l.shortName}</li>
                ))}
              </ul>
            </div>
            <div className="md:col-span-2">
              <p className="font-mono text-[10px] uppercase tracking-widest2 text-brand-bone/50">Index</p>
              <ul className="mt-4 space-y-2 font-mono text-[11px] uppercase tracking-widest2 text-brand-bone/80">
                {navItems.map((n) => (
                  <li key={n.label}><a href={n.href} className="hover:text-brand-ochre">{n.label}</a></li>
                ))}
              </ul>
            </div>
            <div className="md:col-span-2">
              <p className="font-mono text-[10px] uppercase tracking-widest2 text-brand-bone/50">Follow</p>
              <ul className="mt-4 space-y-2 font-mono text-[11px] uppercase tracking-widest2 text-brand-bone/80">
                <li><a href="#" className="hover:text-brand-ochre">Instagram</a></li>
              </ul>
            </div>
          </div>
          <div className="section-shell border-t border-brand-bone/10 py-8 font-mono text-[10px] uppercase tracking-widest2 text-brand-bone/40">
            &copy; {new Date().getFullYear()} Agrobeso &middot; South London
          </div>
        </footer>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-brand-cocoa/10 bg-brand-bone/95 p-2 backdrop-blur md:hidden">
        <ul className="grid grid-cols-4 gap-2">
          <li><a href="#menu" className="sticky-nav-btn">Menu</a></li>
          <li><a href={thorntonHeath.phoneHref} className="sticky-nav-btn">Call</a></li>
          <li><a href={buildMapUrl(thorntonHeath.mapsQuery)} target="_blank" rel="noreferrer" className="sticky-nav-btn">Map</a></li>
          <li><a href="#ordering" className="sticky-nav-btn">Reserve</a></li>
        </ul>
      </nav>

      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </>
  );
};
