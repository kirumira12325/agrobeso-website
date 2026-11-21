/** Inject a page-specific JSON-LD block into <head>; returns a cleanup that removes it. */
export const injectJsonLd = (id: string, data: unknown) => {
  const existing = document.getElementById(id);
  if (existing) existing.remove();
  const el = document.createElement('script');
  el.type = 'application/ld+json';
  el.id = id;
  el.text = JSON.stringify(data);
  document.head.appendChild(el);
  return () => {
    document.getElementById(id)?.remove();
  };
};
