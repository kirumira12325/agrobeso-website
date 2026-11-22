import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { locations } from '@/data/restaurant';

const nav = [
  { label: 'Menu', to: '/menu' },
  { label: 'Peckham', to: '/peckham' },
  { label: 'Thornton Heath', to: '/thornton-heath' },
  { label: 'Reserve', to: '/reserve' },
];

/** Shared header/footer for secondary pages (location + menu). */
export const SiteFrame = ({ children }: { children: ReactNode }) => (
  <>
    <header className="sticky top-0 z-50 border-b border-brand-cocoa/10 bg-brand-bone/85 backdrop-blur-md">
      <div className="section-shell flex items-center justify-between py-5">
        <Link to="/" className="font-display text-2xl font-light tracking-tightest text-brand-cocoa">Agrobeso</Link>
        <nav className="hidden items-center gap-10 font-mono text-[11px] uppercase tracking-widest2 text-brand-cocoa/70 md:flex">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className="transition hover:text-brand-clay">{n.label}</Link>
          ))}
        </nav>
        <Link to="/reserve" className="font-mono text-[11px] uppercase tracking-widest2 text-brand-cocoa md:border-b md:border-brand-cocoa md:pb-1">
          Reserve <span aria-hidden>&rarr;</span>
        </Link>
      </div>
    </header>

    <main>{children}</main>

    <footer className="bg-brand-cocoa text-brand-bone">
      <div className="section-shell grid grid-cols-1 gap-12 py-20 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="font-display text-4xl font-light italic tracking-tightest">Agrobeso</p>
          <p className="mt-4 max-w-xs font-display text-sm italic text-brand-bone/60">
            Authentic Ghanaian &amp; West African cooking, plated in South London.
          </p>
        </div>
        <div className="md:col-span-4">
          <p className="font-mono text-[10px] uppercase tracking-widest2 text-brand-bone/50">Visit</p>
          <ul className="mt-4 space-y-3 text-sm text-brand-bone/80">
            {locations.map((l) => (
              <li key={l.id}>
                <Link to={`/${l.id}`} className="hover:text-brand-ochre">{l.shortName}</Link>
                <span className="block text-brand-bone/50">{l.address}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-3">
          <p className="font-mono text-[10px] uppercase tracking-widest2 text-brand-bone/50">Index</p>
          <ul className="mt-4 space-y-2 font-mono text-[11px] uppercase tracking-widest2 text-brand-bone/80">
            <li><Link to="/" className="hover:text-brand-ochre">Home</Link></li>
            {nav.map((n) => (<li key={n.to}><Link to={n.to} className="hover:text-brand-ochre">{n.label}</Link></li>))}
          </ul>
        </div>
      </div>
      <div className="section-shell border-t border-brand-bone/10 py-8 font-mono text-[10px] uppercase tracking-widest2 text-brand-bone/40">
        &copy; {new Date().getFullYear()} Agrobeso &middot; South London
      </div>
    </footer>
  </>
);
