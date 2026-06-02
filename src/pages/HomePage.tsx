import { useState, useEffect, CSSProperties } from 'react';
import { buildMapUrl, buildRestaurantSchema } from '@/lib/schema';
import { agrobesoSupabase as supabase } from '../integrations/supabase/agrobeso-client';

const STORAGE_URL = 'https://kbopqzhfckbhkumiinmk.supabase.co/storage/v1/object/public/images';

const navItems = [
  { label: 'Menu', href: '#menu' },
  { label: 'Locations', href: '#locations' },
  { label: 'Heritage', href: '#about' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Reserve', href: '/reserve' },
];

// Typography helpers — read font/size overrides from content (admin-controlled)
const FONT_MAP: Record<string, string> = {
  display_serif: '"Playfair Display", Georgia, serif',
  sans_modern: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
  italic_serif: '"Cormorant Garamond", Georgia, serif',
};
const SIZE_MAP: Record<string, string> = {
  S: 'clamp(24px, 4vw, 48px)',
  M: 'clamp(36px, 6vw, 80px)',
  L: 'clamp(56px, 9vw, 130px)',
  XL: 'clamp(72px, 12vw, 180px)',
};
const SECTION_KEY_FOR_FIELD: Record<string, string> = {
  hero_tagline: "hero", hero_headline_line1: "hero", hero_headline_line2: "hero", hero_headline_italic: "hero", hero_subheadline: "hero", hero_featured_dish: "hero",
  manifesto_text: "manifesto",
  menu_headline: "menu", menu_subtext: "menu", menu_footer_note: "menu",
  heritage_headline: "heritage", heritage_paragraph1: "heritage", heritage_paragraph2: "heritage",
  locations_headline: "locations", locations_subtext: "locations",
  peckham_address: "peckham", peckham_phone_label: "peckham", peckham_hours: "peckham",
  thorntonheath_address: "thorntonheath", thorntonheath_phone_label: "thorntonheath", thorntonheath_hours: "thorntonheath",
  gallery_headline: "gallery", gallery_subtext: "gallery",
  ordering_headline: "ordering", ordering_subtext: "ordering",
  contact_headline: "contact", contact_subtext: "contact",
  footer_tagline: "footer",
};
function hStyle(c: Record<string, string>, baseId: string): CSSProperties {
  const f = c[baseId + "_font"];
  const s = c[baseId + "_size"];
  const sectionKey = SECTION_KEY_FOR_FIELD[baseId];
  const sf = sectionKey ? c["section__" + sectionKey + "_font"] : "";
  const ss = sectionKey ? c["section__" + sectionKey + "_size"] : "";
  const font = f || sf;
  const size = s || ss;
  const style: CSSProperties = {};
  if (font && FONT_MAP[font]) style.fontFamily = FONT_MAP[font];
  if (size && SIZE_MAP[size]) { style.fontSize = SIZE_MAP[size]; style.lineHeight = 1.1; }
  return style;
}

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
  dish_jollof_rice_story: 'Long-grain rice slow-simmered in tomato, scotch bonnet and bay until each grain is its own quiet event.',
  dish_jollof_rice_note: 'A dish of celebration',
  dish_waakye_story: 'Rice and beans cooked with sorghum leaves for that deep, unmistakable hue. Served with shito and fried plantain.',
  dish_waakye_note: 'A Saturday morning ritual',
  dish_kenkey_fish_story: 'Fermented corn dough wrapped and steamed, paired with grilled tilapia, fresh pepper and shito.',
  dish_kenkey_fish_note: 'Coastal, warm, complete',
  dish_banku_okra_story: 'Smooth, sour banku alongside an okra stew braised low with smoked fish and spice.',
  dish_banku_okra_note: 'Eaten with the right hand',
  dish_peanut_soup_story: 'Groundnut paste, tomato, ginger and slow-cooked goat — the cold-evening cure.',
  dish_peanut_soup_note: 'Nkate nkwan',
  dish_fufu_story: 'Cassava and plantain pounded to a soft, elastic round. The vehicle, the comfort, the centre.',
  dish_fufu_note: 'Pounded fresh',
  dish_fried_fish_story: 'Whole tilapia scored, marinated and fried until the skin sings. Served with banku or kenkey.',
  dish_fried_fish_note: 'Crisp, smoky, bright',
  dish_tuo_zaafi_story: 'A northern Ghanaian staple of soft millet or maize meal with a leafy green sauce.',
  dish_tuo_zaafi_note: 'From the north',
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



// Reverse map: slug → display name
const slugToName: Record<string, string> = {
  jollof_rice: 'Jollof Rice',
  waakye: 'Waakye',
  kenkey_fish: 'Kenkey & Fish',
  banku_okra: 'Banku & Okra Stew',
  peanut_soup: 'Peanut Soup',
  fufu: 'Fufu / Pounded Yam',
  fried_fish: 'Fried Fish / Tilapia',
  tuo_zaafi: 'Tuo Zaafi',
};
const MENU_CARD_IMAGES: Record<string, string> = {
  'main-1': 'https://kbopqzhfckbhkumiinmk.supabase.co/storage/v1/object/public/images/dish-jollof_rice-1778448765053.png',
  'main-2': 'https://kbopqzhfckbhkumiinmk.supabase.co/storage/v1/object/public/images/dish-waakye-1778448776454.png',
  'main-3': 'https://kbopqzhfckbhkumiinmk.supabase.co/storage/v1/object/public/images/dish-kenkey_fish-1778448785122.png',
  'main-4': 'https://kbopqzhfckbhkumiinmk.supabase.co/storage/v1/object/public/images/dish-fufu-1778449502204.png',
  'soups': 'https://kbopqzhfckbhkumiinmk.supabase.co/storage/v1/object/public/images/dish-peanut_soup-1778448803115.png',
  'extras': 'https://kbopqzhfckbhkumiinmk.supabase.co/storage/v1/object/public/images/dish-banku_okra-1778448793996.png',
  'snacks': 'https://kbopqzhfckbhkumiinmk.supabase.co/storage/v1/object/public/images/dish-fried_fish-1778449520771.png',
};


export const HomePage = () => {
  const schema = buildRestaurantSchema();
  const [c, setC] = useState<Record<string, string>>(defaultContent);
  const [dishImgs, setDishImgs] = useState<Record<string, string>>({});
  const [galleryImgs, setGalleryImgs] = useState<string[]>([]);
  const [heroImg, setHeroImg] = useState<string>('');
  const [minimizedImgs, setMinimizedImgs] = useState<Set<number>>(new Set());
  const [locationImgs, setLocationImgs] = useState<Record<string, string>>({});
  const [heroSlideshow, setHeroSlideshow] = useState<{slug: string; name: string; imgUrl: string; num: number}[]>([]);
  const [heroSlideIdx, setHeroSlideIdx] = useState(0);
  const [heroFading, setHeroFading] = useState(false);
  const [heroSlideshowSlugs, setHeroSlideshowSlugs] = useState<string[]>([]);
  const [menuCategories, setMenuCategories] = useState<Array<{
    id: string;
    title: string;
    priceNote: string | null;
    items: Array<{ name: string; price?: string }>;
  }>>([]);

  useEffect(() => {
    supabase
      .from('site_content')
      .select('id, value')
      .then(({ data }) => {
        if (data && data.length > 0) {
          const map: Record<string, string> = { ...defaultContent };
          const designTokens: Record<string, string> = {};
          const dishImageMap: Record<string, string> = {};

          data.forEach((row: { id: string; value: string }) => {
            if (row.id.startsWith('design__')) {
              designTokens[row.id.replace('design__', '')] = row.value;
            } else if (row.id.startsWith('dish_img__')) {
              dishImageMap[row.id.replace('dish_img__', '')] = row.value;
            } else if (row.id === 'hero_slideshow') {
              setHeroSlideshowSlugs(row.value ? row.value.split(',').map((x: string) => x.trim()).filter(Boolean) : []);
            } else {
              map[row.id] = row.value;
            }
          });

          setC(map);
          setDishImgs(dishImageMap);

          // Apply design tokens as CSS custom properties
          const root = document.documentElement;
          if (designTokens.color_primary) root.style.setProperty('--color-primary', designTokens.color_primary);
          if (designTokens.color_secondary) root.style.setProperty('--color-secondary', designTokens.color_secondary);
          if (designTokens.color_accent) root.style.setProperty('--color-accent', designTokens.color_accent);
          if (designTokens.color_background) root.style.setProperty('--color-bg', designTokens.color_background);
          if (designTokens.color_text) root.style.setProperty('--color-text', designTokens.color_text);
          if (designTokens.font_heading) root.style.setProperty('--font-heading', designTokens.font_heading);
          if (designTokens.font_body) root.style.setProperty('--font-body', designTokens.font_body);
          if (designTokens.border_radius) root.style.setProperty('--radius', designTokens.border_radius + 'px');
        }
      });

    // Load gallery images from Supabase storage (gallery category)
    supabase.storage.from('images').list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } })
      .then(({ data }) => {
        if (data) {
          const galleryFiles = data
            .filter((f: any) => f.name && (f.name.startsWith('gallery-') || f.name.startsWith('hero-')) && f.name !== '.emptyFolderPlaceholder')
            .map((f: any) => STORAGE_URL + '/' + f.name);

          const heroFiles = data
            .filter((f: any) => f.name && f.name.startsWith('hero-') && f.name !== '.emptyFolderPlaceholder')
            .map((f: any) => STORAGE_URL + '/' + f.name);

          const galleryOnlyFiles = data
            .filter((f: any) => f.name && f.name.startsWith('gallery-') && f.name !== '.emptyFolderPlaceholder')
            .map((f: any) => STORAGE_URL + '/' + f.name);

          if (heroFiles.length > 0) setHeroImg(heroFiles[0]);
          if (galleryOnlyFiles.length > 0) setGalleryImgs(galleryOnlyFiles);

          // Load location images
          const locImgMap: Record<string, string> = {};
          data.forEach((f: any) => {
            if (f.name && f.name !== '.emptyFolderPlaceholder') {
              if (f.name.startsWith('peckham-')) locImgMap['peckham'] = STORAGE_URL + '/' + f.name;
              if (f.name.startsWith('thorntonheath-')) locImgMap['thorntonheath'] = STORAGE_URL + '/' + f.name;
            }
          });
          setLocationImgs(locImgMap);
        }
      });
  }, []);

  // Build slideshow list whenever dishImgs or heroSlideshowSlugs change
  useEffect(() => {
    const allSlugs = Object.keys(dishImgs);
    const featured = heroSlideshowSlugs.length > 0 ? heroSlideshowSlugs.filter(sl => dishImgs[sl]) : allSlugs;
    const slides = featured.map((slug, i) => ({
      slug,
      name: slugToName[slug] || slug,
      imgUrl: dishImgs[slug],
      num: i + 1,
    }));
    setHeroSlideshow(slides);
    setHeroSlideIdx(0);
  }, [dishImgs, heroSlideshowSlugs]);

  useEffect(() => {
    supabase
      .from('site_content')
      .select('id, value')
      .eq('id', 'menu_full__categories')
      .single()
      .then(({ data }) => {
        if (data && data.value) {
          try { setMenuCategories(JSON.parse(data.value)); } catch(e) {}
        }
      });
  }, []);

  // Auto-advance timer
  useEffect(() => {
    if (heroSlideshow.length < 2) return;
    const timer = setInterval(() => {
      setHeroFading(true);
      setTimeout(() => {
        setHeroSlideIdx(prev => (prev + 1) % heroSlideshow.length);
        setHeroFading(false);
      }, 400);
    }, 4000);
    return () => clearInterval(timer);
  }, [heroSlideshow]);

  // ── DESIGN ENHANCEMENTS: DOM mutations run once after mount ──
  useEffect(() => {
    // 1. Tag menu items that have a price (enables CSS price pill styling)
    const menuLis = document.querySelectorAll('#menu li');
    menuLis.forEach((li) => {
      if (/£[\d.]+|From £/.test(li.textContent || '')) {
        li.setAttribute('data-hasprice', 'true');
      }
    });

    // 2. Fix Soups "Stew & Fish / Meat / Assorted" line break
    menuLis.forEach((li) => {
      if ((li.textContent || '').includes('Stew & Fish / Meat / Assorted')) {
        li.querySelectorAll('span').forEach((span) => {
          if ((span.textContent || '').includes('Stew & Fish / Meat / Assorted')) {
            span.innerHTML = 'Stew\u00a0& Fish\u00a0/<wbr> Meat\u00a0/ Assorted';
          }
        });
      }
    });

    // 3. Hide duplicate Reserve button (the one outside <nav>)
    const reserveLinks = document.querySelectorAll('header a[href="/reserve"]');
    if (reserveLinks.length > 1) {
      for (let i = 1; i < reserveLinks.length; i++) {
        (reserveLinks[i] as HTMLElement).style.setProperty('display', 'none', 'important');
      }
    }

    // 4. Hide "Rotating weekly specials" text
    document.querySelectorAll('#menu p').forEach((p) => {
      if ((p.textContent || '').includes('Rotating weekly specials')) {
        (p as HTMLElement).style.setProperty('display', 'none', 'important');
      }
    });

    // 5. Mark required form fields
    const requiredNames = ['name', 'phone', 'email'];
    document.querySelectorAll('#contact form input, #contact form textarea').forEach((el) => {
      const input = el as HTMLInputElement;
      const id = (input.id || '').toLowerCase();
      const name = (input.name || '').toLowerCase();
      const ph = (input.placeholder || '').toLowerCase();
      if (requiredNames.some((f) => id.includes(f) || name.includes(f) || ph.includes(f))) {
        input.setAttribute('required', '');
      }
    });

    // Add asterisk to required labels
    document.querySelectorAll('#contact form label').forEach((label) => {
      const input = label.querySelector('input, textarea') as HTMLInputElement | null;
      if (input?.hasAttribute('required')) {
        const span = label.querySelector('span');
        if (span && !span.querySelector('.agro-star')) {
          const star = document.createElement('span');
          star.className = 'agro-star';
          star.textContent = ' *';
          star.style.cssText = 'color:#8a3417;font-weight:700;';
          span.appendChild(star);
        }
      }
    });

    // 6. Fix event date input to use type="date"
    document.querySelectorAll('#contact form input').forEach((el) => {
      const input = el as HTMLInputElement;
      const ph = (input.placeholder || '').toLowerCase();
      const name = (input.name || '').toLowerCase();
      if ((ph.includes('when') || name.includes('date') || name.includes('event')) && input.type === 'text') {
        input.type = 'date';
      }
    });

    // 7. Form success state — intercept send button click
    const form = document.querySelector('#contact form');
    if (form && !document.getElementById('agro-success')) {
      const wrapper = form.parentElement;
      if (wrapper) {
        wrapper.style.position = 'relative';
        const success = document.createElement('div');
        success.id = 'agro-success';
        success.style.cssText = [
          'display:none',
          'position:absolute',
          'inset:0',
          'background:radial-gradient(120% 100%,rgb(255,249,240) 0%,rgb(245,232,206) 60%,rgb(237,220,182) 100%)',
          'border:1px solid rgba(180,137,47,0.35)',
          'border-radius:14px 9px 13px 8px',
          'z-index:10',
          'flex-direction:column',
          'align-items:center',
          'justify-content:center',
          'text-align:center',
          'padding:3rem 2rem',
        ].join(';');
        success.innerHTML = [
          '<div style="font-size:3rem;margin-bottom:1rem;color:#b4892f;">\u2713</div>',
          '<p style="font-family:Fraunces,serif;font-size:1.4rem;color:#2a1a12;font-weight:600;margin-bottom:0.5rem;">Thank you!</p>',
          '<p style="font-family:Courier New,monospace;font-size:0.72rem;letter-spacing:0.15em;color:#8a3417;text-transform:uppercase;">Your enquiry has been received.<br>We\'ll be in touch shortly.</p>',
        ].join('');
        wrapper.appendChild(success);
        const btn = form.querySelector('button[type="button"]') as HTMLButtonElement | null;
        if (btn) {
          btn.addEventListener('click', () => {
            success.style.display = 'flex';
            (form as HTMLElement).style.opacity = '0';
            (form as HTMLElement).style.pointerEvents = 'none';
          });
        }
      }
    }

    // 8. Improve gallery alt text
    const altTexts = [
      'Jollof rice with fried chicken — Agrobeso signature dish',
      'Banku and tilapia with pepper sauce',
      'Fufu with light soup and goat meat',
      'Kelewele — Ghanaian spiced fried plantain',
      'Waakye served with fish and slaw',
    ];
    document.querySelectorAll('#gallery img').forEach((img, i) => {
      const el = img as HTMLImageElement;
      if (!el.alt || el.alt.length < 15) el.alt = altTexts[i % altTexts.length];
    });

    // 9. Scroll-spy: highlight active nav link as user scrolls
    const sectionIds = ['menu', 'locations', 'about', 'gallery', 'ordering', 'contact'];
    const navLinks = document.querySelectorAll('header nav a');
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const id = (entry.target as HTMLElement).id;
              navLinks.forEach((link) => {
                link.removeAttribute('data-active');
                if (link.getAttribute('href') === '#' + id) link.setAttribute('data-active', 'true');
              });
            }
          });
        },
        { threshold: 0.3 }
      );
      sectionIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      });
    }
  }, []);

  const peckham = {
    id: 'peckham' as const,
    shortName: 'Peckham',
    address: c.peckham_address,
    phoneLabel: c.peckham_phone_label,
    phoneHref: c.peckham_phone_href,
    mapsQuery: c.peckham_address,
    openingHoursPlaceholder: c.peckham_hours,
    addressFieldId: 'peckham_address',
    phoneLabelFieldId: 'peckham_phone_label',
    hoursFieldId: 'peckham_hours',
  };

  const thorntonHeath = {
    id: 'thornton-heath' as const,
    shortName: 'Thornton Heath',
    address: c.thorntonheath_address,
    phoneLabel: c.thorntonheath_phone_label,
    phoneHref: c.thorntonheath_phone_href,
    mapsQuery: c.thorntonheath_address,
    openingHoursPlaceholder: c.thorntonheath_hours,
    addressFieldId: 'thorntonheath_address',
    phoneLabelFieldId: 'thorntonheath_phone_label',
    hoursFieldId: 'thorntonheath_hours',
  };

  const locations = [peckham, thorntonHeath];

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-brand-cocoa/10 bg-brand-bone/85 backdrop-blur-md">
        <div className="section-shell flex items-center justify-between py-5">
          <a href="#top" className="font-display text-2xl font-light tracking-tightest text-brand-cocoa">Agrobeso</a>
          <nav className="hidden items-center gap-10 font-mono text-[11px] uppercase tracking-widest2 text-brand-cocoa/70 md:flex">
            {navItems.map((item) => (
              <a key={item.label} href={item.href} className="transition hover:text-brand-clay">{item.label}</a>
            ))}
          </nav>
          <a href="/reserve" className="hidden font-mono text-[11px] uppercase tracking-widest2 text-brand-cocoa md:inline-flex md:items-center md:gap-2 md:border-b md:border-brand-cocoa md:pb-1">
            Reserve <span aria-hidden>&rarr;</span>
          </a>
        </div>
      </header>

      <main id="top">
        {/* HERO */}
        <section className="hero-pattern relative overflow-hidden">
          <div className="section-shell grid min-h-[88vh] grid-cols-1 items-center gap-16 py-24 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-7 reveal">
              <p className="eyebrow mb-10 !whitespace-normal">— {<span style={hStyle(c, 'hero_tagline')}>{c.hero_tagline}</span>}</p>
              <h1 className="display text-[clamp(56px,9vw,144px)]" style={hStyle(c, 'hero_headline_line1')}>
                {<span style={hStyle(c, 'hero_headline_line1')}>{c.hero_headline_line1}</span>}<br />{<span style={hStyle(c, 'hero_headline_line2')}>{c.hero_headline_line2}</span>}<br />
                <em className="font-display italic text-brand-clay">{<span style={hStyle(c, 'hero_headline_italic')}>{c.hero_headline_italic}</span>}</em>
              </h1>
              <p className="mt-12 max-w-md font-display text-xl italic text-brand-cocoa/70">{<span style={hStyle(c, 'hero_subheadline')}>{c.hero_subheadline}</span>}</p>
              <div className="mt-12 flex flex-wrap items-center gap-8">
                <a href="#menu" className="font-mono text-[11px] uppercase tracking-widest2 text-brand-cocoa">
                  <span className="border-b border-brand-cocoa pb-1">View the menu</span>
                </a>
                <a href="/reserve" className="font-mono text-[11px] uppercase tracking-widest2 text-brand-cocoa/60 transition hover:text-brand-clay">Reserve a table &rarr;</a>
              </div>
            </div>
            <div className="lg:col-span-5">
              {heroSlideshow.length > 0 ? (
                <div className="aspect-[4/5] w-full overflow-hidden rounded-lg relative" style={{position:'relative'}}>
                  {heroSlideshow.map((slide, idx) => (
                    <div
                      key={slide.slug}
                      style={{
                        position: idx === 0 ? 'relative' : 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        opacity: idx === heroSlideIdx ? (heroFading ? 0 : 1) : 0,
                        transition: 'opacity 0.4s ease',
                        pointerEvents: idx === heroSlideIdx ? 'auto' : 'none',
                      }}
                    >
                      <img src={slide.imgUrl} alt={slide.name} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-10 text-brand-bone">
                        <p className="font-mono text-[10px] uppercase tracking-widest2 text-brand-bone/70">No. {String(slide.num).padStart(2,'0')} / Of the season</p>
                        <p className="mt-4 font-display text-3xl italic">{slide.name}</p>
                        {heroSlideshow.length > 1 && (
                          <div style={{display:'flex',gap:'6px',marginTop:'12px'}}>
                            {heroSlideshow.map((_, di) => (
                              <button
                                key={di}
                                aria-label={`Go to slide ${di+1}`}
                                onClick={() => { setHeroFading(true); setTimeout(() => { setHeroSlideIdx(di); setHeroFading(false); }, 400); }}
                                style={{
                                  width: di === heroSlideIdx ? '20px' : '6px',
                                  height: '6px',
                                  borderRadius: '3px',
                                  background: di === heroSlideIdx ? '#fff' : 'rgba(255,255,255,0.45)',
                                  border: 'none',
                                  cursor: 'pointer',
                                  padding: 0,
                                  transition: 'width 0.3s ease, background 0.3s ease',
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : heroImg ? (
                <div className="aspect-[4/5] w-full overflow-hidden rounded-lg relative">
                  <img src={heroImg} alt="Agrobeso hero" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-10 text-brand-bone">
                    <p className="font-mono text-[10px] uppercase tracking-widest2 text-brand-bone/70">No. 01 / Of the season</p>
                    <p className="mt-4 font-display text-3xl italic">{<span style={hStyle(c, 'hero_featured_dish')}>{c.hero_featured_dish}</span>}</p>
                  </div>
                </div>
              ) : (
                <div className="canvas-img-dark aspect-[4/5] w-full overflow-hidden">
                  <div className="flex h-full flex-col justify-end p-10 text-brand-bone">
                    <p className="font-mono text-[10px] uppercase tracking-widest2 text-brand-bone/70">No. 01 / Of the season</p>
                    <p className="mt-4 font-display text-3xl italic">{<span style={hStyle(c, 'hero_featured_dish')}>{c.hero_featured_dish}</span>}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* MANIFESTO */}
        <section id="manifesto" className="border-t border-brand-cocoa/10 bg-brand-shell">
          <div className="section-shell grid grid-cols-1 gap-16 py-32 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <p className="eyebrow">— I</p>
              <p className="mt-3 font-mono text-[11px] uppercase tracking-widest2 text-brand-cocoa/60">Manifesto</p>
            </div>
            <div className="lg:col-span-8 lg:col-start-5">
              <p className="font-display text-3xl font-light leading-snug text-brand-cocoa sm:text-4xl">{<span style={hStyle(c, 'manifesto_text')}>{c.manifesto_text}</span>}</p>
            </div>
          </div>
        </section>

        {/* MENU */}
        <section id="menu" className="bg-brand-bone">
          <div className="section-shell py-32">
            <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
              <div className="lg:col-span-3">
                <p className="eyebrow">— II</p>
                <p className="mt-3 font-mono text-[11px] uppercase tracking-widest2 text-brand-cocoa/60">The Menu</p>
              </div>
              <div className="lg:col-span-8 lg:col-start-5">
                <h2 className="display text-5xl sm:text-6xl" style={hStyle(c, 'menu_headline')}>{<span style={hStyle(c, 'menu_headline')}>{c.menu_headline}</span>}</h2>
                <p className="mt-6 max-w-md font-display text-lg italic text-brand-cocoa/65">{<span style={hStyle(c, 'menu_subtext')}>{c.menu_subtext}</span>}</p>
              </div>
            </div>
                          {menuCategories.length > 0 ? (
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {menuCategories.map((group) => (
                    <div key={group.id} className="rounded-lg border border-brand-cocoa/10 bg-brand-shell p-6 overflow-hidden relative" style={MENU_CARD_IMAGES[group.id] ? { backgroundImage: 'url(' + MENU_CARD_IMAGES[group.id] + ')', backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
              {!!MENU_CARD_IMAGES[group.id] && <div className="absolute inset-0" style={{ background: 'rgba(245,241,234,0.88)' }} />}
                    <div className="relative z-10">
                      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                        <p className="eyebrow text-sm font-bold tracking-wide">{group.title}</p>
                        {group.priceNote && (
                          <span className="inline-block rounded bg-brand-clay/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-brand-clay font-bold">
                            {group.priceNote}
                          </span>
                        )}
                      </div>
                      <ul className="mt-2 space-y-1.5 list-none">
                        {group.items.map((item, idx) => (
                          <li key={idx} className="flex items-baseline justify-between gap-2 font-display text-[15px] text-brand-cocoa/80">
                            <span className="flex items-baseline gap-1.5"><span className="text-brand-clay font-bold text-base leading-none">•</span><span>{item.name}</span></span>
                            {item.price && (
                              <span className="shrink-0 font-mono text-[12px] text-brand-clay">{item.price}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    { title: 'Main Dishes', note: 'Take Away £15 / Eat-In £17', items: ['Banku & Soup', 'Fufu & Soup', 'Jollof & Goat Meat'] },
                    { title: 'Soups', note: '£12.00', items: ['Light Soup', 'Palm Soup', 'Peanut Soup'] },
                    { title: 'Extras & Snacks', note: 'From £2.00', items: ['Fried Plantain', 'Kenkey', 'Pies'] },
                  ].map((g) => (
                    <div key={g.title} className="rounded-lg border border-brand-cocoa/10 bg-brand-shell p-6">
                      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                        <p className="eyebrow text-sm">{g.title}</p>
                        <span className="inline-block rounded bg-brand-clay/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-brand-clay font-bold">{g.note}</span>
                      </div>
                      <ul className="mt-2 space-y-1.5">
                        {g.items.map((item) => (
                          <li key={item} className="font-display text-[15px] text-brand-cocoa/80">{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            <p className="mt-16 max-w-lg font-display text-sm italic text-brand-cocoa/55">{<span style={hStyle(c, 'menu_footer_note')}>{c.menu_footer_note}</span>}</p>
          </div>
        </section>

        {/* HERITAGE */}
        <section id="about" className="border-t border-brand-cocoa/10 bg-brand-cocoa text-brand-bone">
          <div className="section-shell grid grid-cols-1 gap-16 py-32 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <p className="font-mono text-[11px] uppercase tracking-widest2 text-brand-ochre">— III</p>
              <p className="mt-3 font-mono text-[11px] uppercase tracking-widest2 text-brand-bone/50">Heritage</p>
            </div>
            <div className="lg:col-span-8 lg:col-start-5">
              <h2 className="font-display text-5xl font-light tracking-tightest sm:text-6xl" style={hStyle(c, 'heritage_headline')}>{<span style={hStyle(c, 'heritage_headline')}>{c.heritage_headline}</span>}</h2>
              <p className="mt-10 max-w-2xl font-display text-xl italic text-brand-bone/75">{<span style={hStyle(c, 'heritage_paragraph1')}>{c.heritage_paragraph1}</span>}</p>
              <p className="mt-8 max-w-xl text-[15px] leading-relaxed text-brand-bone/60">{<span style={hStyle(c, 'heritage_paragraph2')}>{c.heritage_paragraph2}</span>}</p>
            </div>
          </div>
        </section>

        {/* LOCATIONS */}
        <section id="locations" className="bg-brand-bone">
          <div className="section-shell py-32">
            <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
              <div className="lg:col-span-3">
                <p className="eyebrow">— IV</p>
                <p className="mt-3 font-mono text-[11px] uppercase tracking-widest2 text-brand-cocoa/60">Two Tables</p>
              </div>
              <div className="lg:col-span-8 lg:col-start-5">
                <h2 className="display text-5xl sm:text-6xl" style={hStyle(c, 'locations_headline')}>{<span style={hStyle(c, 'locations_headline')}>{c.locations_headline}</span>}</h2>
                <p className="mt-6 max-w-md font-display text-lg italic text-brand-cocoa/65">{<span style={hStyle(c, 'locations_subtext')}>{c.locations_subtext}</span>}</p>
              </div>
            </div>
            <div className="mt-20 grid grid-cols-1 gap-px bg-brand-cocoa/15 md:grid-cols-2">
              {locations.map((location, i) => (
                <article key={location.id} className="bg-brand-bone p-10 sm:p-14">
                  <p className="font-mono text-[11px] uppercase tracking-widest2 text-brand-clay">{String(i + 1).padStart(2, '0')} / {location.shortName}</p>
                  <h3 className="mt-6 font-display text-4xl font-light tracking-tightest text-brand-cocoa sm:text-5xl">{location.shortName}</h3>
                  <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-brand-cocoa/70"><span style={hStyle(c, location.addressFieldId)}>{location.address}</span></p>
                  <p className="mt-4 font-display text-sm italic text-brand-cocoa/50"><span style={hStyle(c, location.hoursFieldId)}>{location.openingHoursPlaceholder}</span></p>
                  <div className="mt-10 flex flex-wrap gap-6 font-mono text-[11px] uppercase tracking-widest2">
                    <a href={buildMapUrl(location.mapsQuery)} target="_blank" rel="noreferrer" className="border-b border-brand-cocoa pb-1 text-brand-cocoa transition hover:text-brand-clay">Directions &rarr;</a>
                    <a href={location.phoneHref} className="border-b border-brand-cocoa/30 pb-1 text-brand-cocoa/70 transition hover:border-brand-cocoa hover:text-brand-cocoa">Call</a>
                  </div>
                  {locationImgs[location.id.replace('-', '')] && (
                    <div className="mt-8 overflow-hidden rounded-lg">
                      <img
                        src={locationImgs[location.id.replace('-', '')]}
                        alt={location.shortName + ' restaurant'}
                        className="w-full h-56 object-cover"
                      />
                    </div>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* GALLERY */}
        <section id="gallery" className="border-t border-brand-cocoa/10 bg-brand-shell">
          <div className="section-shell py-32">
            <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
              <div className="lg:col-span-3">
                <p className="eyebrow">— V</p>
                <p className="mt-3 font-mono text-[11px] uppercase tracking-widest2 text-brand-cocoa/60">In the Kitchen</p>
              </div>
              <div className="lg:col-span-8 lg:col-start-5">
                <h2 className="display text-5xl sm:text-6xl" style={hStyle(c, 'gallery_headline')}>{<span style={hStyle(c, 'gallery_headline')}>{c.gallery_headline}</span>}</h2>
                <p className="mt-6 max-w-md font-display text-lg italic text-brand-cocoa/65">{<span style={hStyle(c, 'gallery_subtext')}>{c.gallery_subtext}</span>}</p>
              </div>
            </div>
            <div className="mt-20 grid grid-cols-12 gap-6">
              {galleryImgs.length > 0 ? (
                <>
                  <div className="col-span-12 aspect-[3/2] md:col-span-7 overflow-hidden rounded-lg">
                    <img src={galleryImgs[0]} alt="Gallery 1" className="w-full h-full object-cover" />
                  </div>
                  <div className="col-span-12 aspect-[3/2] md:col-span-5 overflow-hidden rounded-lg">
                    {galleryImgs[1]
                      ? <img src={galleryImgs[1]} alt="Gallery 2" className="w-full h-full object-cover" />
                      : <div className="canvas-img-dark w-full h-full" />}
                  </div>
                  <div className="col-span-6 aspect-square md:col-span-4 overflow-hidden rounded-lg">
                    {galleryImgs[2]
                      ? <img src={galleryImgs[2]} alt="Gallery 3" className="w-full h-full object-cover" />
                      : <div className="canvas-img-dark w-full h-full" />}
                  </div>
                  <div className="col-span-6 aspect-square md:col-span-4 overflow-hidden rounded-lg">
                    {galleryImgs[3]
                      ? <img src={galleryImgs[3]} alt="Gallery 4" className="w-full h-full object-cover" />
                      : <div className="canvas-img w-full h-full" />}
                  </div>
                  <div className="col-span-12 aspect-[3/2] md:col-span-4 overflow-hidden rounded-lg">
                    {galleryImgs[4]
                      ? <img src={galleryImgs[4]} alt="Gallery 5" className="w-full h-full object-cover" />
                      : <div className="canvas-img w-full h-full" />}
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

        {/* ORDERING */}
        <section id="ordering" className="border-t border-brand-cocoa/10 bg-brand-bone">
          <div className="section-shell py-32 text-center">
            <p className="eyebrow">— VI / The invitation</p>
            <h2 className="display mt-8 text-5xl sm:text-7xl" style={hStyle(c, 'ordering_headline')}>{<span style={hStyle(c, 'ordering_headline')}>{c.ordering_headline}</span>}</h2>
            <p className="mx-auto mt-8 max-w-xl font-display text-xl italic text-brand-cocoa/70">{<span style={hStyle(c, 'ordering_subtext')}>{c.ordering_subtext}</span>}</p>
            <div className="mx-auto mt-16 flex max-w-2xl flex-wrap items-center justify-center gap-8 font-mono text-[11px] uppercase tracking-widest2">
              <a href={peckham.phoneHref} className="border-b border-brand-cocoa pb-1 text-brand-cocoa transition hover:text-brand-clay">Call Peckham &rarr;</a>
              <a href={thorntonHeath.phoneHref} className="border-b border-brand-cocoa pb-1 text-brand-cocoa transition hover:text-brand-clay">Call Thornton Heath &rarr;</a>
              <a href={buildMapUrl(thorntonHeath.mapsQuery)} target="_blank" rel="noreferrer" className="border-b border-brand-cocoa/30 pb-1 text-brand-cocoa/70 transition hover:border-brand-cocoa hover:text-brand-cocoa">Directions</a>
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="border-t border-brand-cocoa/10 bg-brand-shell">
          <div className="section-shell grid grid-cols-1 gap-20 py-32 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="eyebrow">— VII</p>
              <h2 className="display mt-6 text-4xl sm:text-5xl" style={hStyle(c, 'contact_headline')}>{<span style={hStyle(c, 'contact_headline')}>{c.contact_headline}</span>}</h2>
              <p className="mt-6 max-w-sm font-display text-lg italic text-brand-cocoa/65">{<span style={hStyle(c, 'contact_subtext')}>{c.contact_subtext}</span>}</p>
              <div className="mt-12 space-y-5 text-[15px] text-brand-cocoa/80">
                {locations.map((location) => (
                  <div key={location.id}>
                    <p className="font-mono text-[10px] uppercase tracking-widest2 text-brand-cocoa/50">{location.shortName}</p>
                    <a href={location.phoneHref} className="mt-1 block font-display text-2xl text-brand-cocoa transition hover:text-brand-clay"><span style={hStyle(c, location.phoneLabelFieldId)}>{location.phoneLabel}</span></a>
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
              <button type="button" className="primary-btn mt-10 w-full justify-center">Send enquiry &rarr;</button>
            </form>
          </div>
        </section>

        {/* FOOTER */}
        <footer id="footer" className="bg-brand-cocoa text-brand-bone">
          <div className="section-shell grid grid-cols-1 gap-12 py-20 md:grid-cols-12">
            <div className="md:col-span-5">
              <p className="font-display text-4xl font-light tracking-tightest">Agrobeso</p>
              <p className="mt-4 max-w-xs font-display text-sm italic text-brand-bone/60">{<span style={hStyle(c, 'footer_tagline')}>{c.footer_tagline}</span>}</p>
            </div>
            <div className="md:col-span-3">
              <p className="font-mono text-[10px] uppercase tracking-widest2 text-brand-bone/50">Visit</p>
              <ul className="mt-4 space-y-2 text-sm text-brand-bone/80">
                {locations.map((l) => (<li key={l.id}>{l.shortName}</li>))}
              </ul>
            </div>
            <div className="md:col-span-2">
              <p className="font-mono text-[10px] uppercase tracking-widest2 text-brand-bone/50">Index</p>
              <ul className="mt-4 space-y-2 font-mono text-[11px] uppercase tracking-widest2 text-brand-bone/80">
                {navItems.map((n) => (<li key={n.label}><a href={n.href} className="hover:text-brand-ochre">{n.label}</a></li>))}
              </ul>
            </div>
            <div className="md:col-span-2">
              <p className="font-mono text-[10px] uppercase tracking-widest2 text-brand-bone/50">Follow</p>
              <ul className="mt-4 space-y-2 font-mono text-[11px] uppercase tracking-widest2 text-brand-bone/80">
                <li><a href={c.instagram_url} className="hover:text-brand-ochre">Instagram</a></li>
              </ul>
            </div>
          </div>
          <div className="section-shell border-t border-brand-bone/10 py-8 font-mono text-[10px] uppercase tracking-widest2 text-brand-bone/40">
            &copy; {new Date().getFullYear()} Agrobeso &middot; South London
          </div>
        </footer>
      </main>

      {/* MOBILE NAV */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-brand-cocoa/10 bg-brand-bone/95 p-2 backdrop-blur md:hidden">
        <ul className="grid grid-cols-4 gap-2">
          <li><a href="#menu" className="sticky-nav-btn">Menu</a></li>
          <li><a href={thorntonHeath.phoneHref} className="sticky-nav-btn">Call</a></li>
          <li><a href={buildMapUrl(thorntonHeath.mapsQuery)} target="_blank" rel="noreferrer" className="sticky-nav-btn">Map</a></li>
          <li><a href="/reserve" className="sticky-nav-btn">Reserve</a></li>
        </ul>
      </nav>

      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </>
  );
};
