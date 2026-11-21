const SITE_URL = 'https://www.agrobeso.org';

const upsertMeta = (name: string, content: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.name = name;
    document.head.appendChild(el);
  }
  el.content = content;
};

const upsertLink = (rel: string, href: string) => {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
};

type PageSeo = {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
};

/**
 * Sets per-route title, description, canonical and robots tags.
 * Returns a cleanup function that restores the homepage defaults from index.html.
 */
export const applyPageSeo = ({ title, description, path, noindex }: PageSeo) => {
  const prev = {
    title: document.title,
    description: document.head.querySelector<HTMLMetaElement>('meta[name="description"]')?.content ?? '',
    canonical: document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href ?? `${SITE_URL}/`,
    robots: document.head.querySelector<HTMLMetaElement>('meta[name="robots"]')?.content ?? 'index, follow',
  };

  document.title = title;
  upsertMeta('description', description);
  upsertLink('canonical', `${SITE_URL}${path}`);
  upsertMeta('robots', noindex ? 'noindex, nofollow' : prev.robots);

  return () => {
    document.title = prev.title;
    upsertMeta('description', prev.description);
    upsertLink('canonical', prev.canonical);
    upsertMeta('robots', prev.robots);
  };
};
