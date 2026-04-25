import { buildMapUrl, buildRestaurantSchema } from '@/lib/schema';
import { heroContent, locations, menuGroups, signatureDishes } from '@/data/restaurant';

const navItems = [
  { label: 'Menu', href: '#menu' },
  { label: 'Locations', href: '#locations' },
  { label: 'About', href: '#about' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Contact', href: '#contact' }
];

const peckham = locations[0];
const thorntonHeath = locations[1];

const deliveryLinks = [
  { label: 'Uber Eats', href: '#' },
  { label: 'Deliveroo', href: '#' },
  { label: 'Just Eat', href: '#' }
];

export const HomePage = () => {
  const schema = buildRestaurantSchema();

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-brand-charcoal bg-brand-charcoal/95 backdrop-blur">
        <div className="section-shell flex items-center justify-between py-4">
          <a href="#top" className="text-2xl font-black tracking-tight text-brand-cream">
            Agrobeso
          </a>
          <nav className="hidden items-center gap-5 text-sm text-brand-cream/85 md:flex">
            {navItems.map((item) => (
              <a key={item.label} href={item.href} className="transition hover:text-brand-gold">
                {item.label}
              </a>
            ))}
          </nav>
          <a
            href="#ordering"
            className="rounded-full bg-brand-gold px-4 py-2 text-sm font-semibold text-brand-charcoal shadow-soft transition hover:brightness-105"
          >
            Order Now
          </a>
        </div>
      </header>

      <main id="top">
        <section className="hero-pattern border-b border-brand-charcoal/30 py-14 sm:py-20">
          <div className="section-shell grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-6">
              <p className="inline-flex rounded-full border border-brand-gold/50 bg-brand-gold/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
                Peckham & Thornton Heath
              </p>
              <h1 className="text-4xl font-black leading-tight text-brand-cream sm:text-5xl lg:text-6xl">
                {heroContent.headline}
              </h1>
              <p className="max-w-2xl text-lg leading-relaxed text-brand-cream/85">{heroContent.subheadline}</p>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a href="#menu" className="primary-btn">
                  View Menu
                </a>
                <a href="#locations" className="secondary-btn">
                  Choose Location
                </a>
                <a href={thorntonHeath.phoneHref} className="secondary-btn">
                  Call to Order
                </a>
              </div>
            </div>
            <div className="rounded-3xl border border-brand-charcoal/40 bg-gradient-to-br from-brand-green to-brand-terracotta p-8 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-cream/80">Signature flavour</p>
              <h2 className="mt-3 text-2xl font-bold text-brand-cream">Home-style cooking, made fresh daily.</h2>
              <p className="mt-4 text-brand-cream/90">
                Crafted with rich spices, slow-cooked stews and comforting Ghanaian favourites for families, friends and quick takeaway nights.
              </p>
            </div>
          </div>
        </section>

        <section id="signature-dishes" className="py-14 sm:py-20">
          <div className="section-shell space-y-8">
            <SectionHeading title="Signature dishes" subtitle="Made to satisfy cravings for authentic Ghanaian and West African food." />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {signatureDishes.map((dish) => (
                <article key={dish} className="rounded-2xl border border-brand-charcoal/60 bg-brand-charcoal/40 p-5">
                  <h3 className="text-lg font-semibold text-brand-cream">{dish}</h3>
                  <p className="mt-2 text-sm text-brand-cream/75">Prepared with balanced spices, hearty portions and warm hospitality.</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="locations" className="border-y border-brand-charcoal/40 bg-brand-charcoal/30 py-14 sm:py-20">
          <div className="section-shell space-y-8">
            <SectionHeading title="Our locations" subtitle="Choose the branch nearest you and confirm opening times before visiting." />
            <div className="grid gap-5 md:grid-cols-2">
              {locations.map((location) => (
                <article key={location.id} className="rounded-2xl border border-brand-charcoal/60 bg-brand-charcoal/60 p-5">
                  <h3 className="text-xl font-bold text-brand-cream">{location.shortName}</h3>
                  <p className="mt-3 text-brand-cream/85">{location.address}</p>
                  <p className="mt-3 rounded-lg bg-brand-gold/15 px-3 py-2 text-sm text-brand-gold">
                    {location.openingHoursPlaceholder}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <a href={buildMapUrl(location.mapsQuery)} target="_blank" rel="noreferrer" className="secondary-btn">
                      Get Directions
                    </a>
                    <a href={location.phoneHref} className="secondary-btn">
                      Call
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="menu" className="py-14 sm:py-20">
          <div className="section-shell space-y-8">
            <SectionHeading title="Menu preview" subtitle="A quick look at what guests love most. Full menu available in-store and by phone." />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {menuGroups.map((group) => (
                <article key={group.title} className="rounded-2xl border border-brand-charcoal/60 bg-brand-charcoal/40 p-5">
                  <h3 className="text-lg font-bold text-brand-cream">{group.title}</h3>
                  <ul className="mt-3 space-y-2 text-sm text-brand-cream/80">
                    {group.items.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span aria-hidden className="mt-2 h-1.5 w-1.5 rounded-full bg-brand-gold" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
            <p className="text-sm text-brand-cream/70">Prices are not shown here. Please contact a branch for the latest menu and pricing.</p>
          </div>
        </section>

        <section id="about" className="border-y border-brand-charcoal/40 bg-brand-charcoal/30 py-14 sm:py-20">
          <div className="section-shell grid gap-8 lg:grid-cols-2 lg:items-center">
            <SectionHeading
              title="About Agrobeso"
              subtitle="Agrobeso brings the taste of Ghana and West Africa to South London with food made for comfort, sharing and celebration."
            />
            <p className="text-brand-cream/85">
              From rich soups and stews to perfectly seasoned rice dishes and grilled fish, our kitchen serves meals inspired by home cooking traditions and community hospitality.
            </p>
          </div>
        </section>

        <section id="gallery" className="py-14 sm:py-20">
          <div className="section-shell space-y-8">
            <SectionHeading title="Gallery" subtitle="A visual preview of food, dining atmosphere and service." />
            {/* Replace all placeholder blocks below with owner-approved photos before launch. */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {['Signature dishes', 'Dining moments', 'Kitchen craft', 'Takeaway orders', 'Family platters', 'Weekend favourites'].map((item) => (
                <article key={item} className="rounded-2xl border border-brand-charcoal/60 bg-gradient-to-br from-brand-green/75 to-brand-terracotta/80 p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-cream/85">Placeholder image</p>
                  <h3 className="mt-3 text-xl font-semibold text-brand-cream">{item}</h3>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-brand-charcoal/40 bg-brand-charcoal/30 py-14 sm:py-16">
          <div className="section-shell">
            <SectionHeading
              title="Loved for flavour and generosity"
              subtitle="Customers often praise the generous portions, authentic flavours, and friendly service."
            />
          </div>
        </section>

        <section id="ordering" className="py-14 sm:py-20">
          <div className="section-shell rounded-3xl border border-brand-gold/35 bg-brand-green/20 p-6 sm:p-10">
            <SectionHeading title="Ready to order?" subtitle="Call your nearest branch or choose delivery to enjoy Agrobeso at home." />
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={peckham.phoneHref} className="primary-btn">
                Call Peckham
              </a>
              <a href={thorntonHeath.phoneHref} className="primary-btn">
                Call Thornton Heath
              </a>
              <a href={buildMapUrl(thorntonHeath.mapsQuery)} target="_blank" rel="noreferrer" className="secondary-btn">
                Get Directions
              </a>
              <a href="#" className="secondary-btn">
                Order Delivery
              </a>
            </div>
            <p className="mt-4 text-sm text-brand-cream/80">Delivery platform links are placeholders. Connect your preferred platform accounts before launch.</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-brand-cream/70">
              {deliveryLinks.map((delivery) => (
                <a key={delivery.label} href={delivery.href} className="rounded-full border border-brand-cream/25 px-3 py-1.5 hover:text-brand-gold">
                  {delivery.label}
                </a>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="border-t border-brand-charcoal/40 py-14 sm:py-20">
          <div className="section-shell grid gap-8 lg:grid-cols-2">
            <div className="space-y-5">
              <SectionHeading title="Contact" subtitle="Choose a location, call directly, or send a catering and group order enquiry." />
              <label className="block text-sm font-medium text-brand-cream" htmlFor="location-selector">
                Location selector
              </label>
              <select id="location-selector" className="w-full rounded-xl border border-brand-charcoal/60 bg-brand-charcoal/70 px-4 py-3 text-brand-cream">
                {locations.map((location) => (
                  <option key={location.id}>{location.shortName}</option>
                ))}
              </select>
              <div className="space-y-2 text-brand-cream/85">
                {locations.map((location) => (
                  <p key={location.id}>
                    <span className="font-semibold">{location.shortName}:</span>{' '}
                    <a href={location.phoneHref} className="text-brand-gold hover:text-brand-cream">
                      {location.phoneLabel}
                    </a>
                  </p>
                ))}
              </div>
              <a href={buildMapUrl(thorntonHeath.mapsQuery)} target="_blank" rel="noreferrer" className="secondary-btn inline-flex">
                Google Maps placeholder
              </a>
            </div>

            <form className="space-y-4 rounded-2xl border border-brand-charcoal/60 bg-brand-charcoal/40 p-5">
              <h3 className="text-xl font-semibold text-brand-cream">Catering / group order enquiry</h3>
              <input className="form-input" type="text" name="name" placeholder="Name" />
              <input className="form-input" type="tel" name="phone" placeholder="Phone" />
              <input className="form-input" type="email" name="email" placeholder="Email" />
              <input className="form-input" type="text" name="event-date" placeholder="Event date" />
              <textarea className="form-input min-h-32" name="message" placeholder="Tell us about your event, number of guests, and preferred dishes." />
              <button type="button" className="primary-btn w-full justify-center">
                Send enquiry
              </button>
            </form>
          </div>
        </section>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-brand-charcoal bg-brand-charcoal/95 p-2 md:hidden">
        <ul className="grid grid-cols-4 gap-2 text-xs font-semibold text-brand-cream">
          <li>
            <a href="#menu" className="sticky-nav-btn">
              Menu
            </a>
          </li>
          <li>
            <a href={thorntonHeath.phoneHref} className="sticky-nav-btn">
              Call
            </a>
          </li>
          <li>
            <a href={buildMapUrl(thorntonHeath.mapsQuery)} target="_blank" rel="noreferrer" className="sticky-nav-btn">
              Directions
            </a>
          </li>
          <li>
            <a href="#ordering" className="sticky-nav-btn">
              Order
            </a>
          </li>
        </ul>
      </nav>

      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </>
  );
};

type SectionHeadingProps = {
  title: string;
  subtitle: string;
};

const SectionHeading = ({ title, subtitle }: SectionHeadingProps) => (
  <header className="space-y-3">
    <h2 className="text-3xl font-bold tracking-tight text-brand-cream sm:text-4xl">{title}</h2>
    <p className="max-w-3xl text-brand-cream/80">{subtitle}</p>
  </header>
);

