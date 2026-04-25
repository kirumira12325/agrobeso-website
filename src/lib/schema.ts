import { locations, siteMeta } from '@/data/restaurant';

const buildMapUrl = (query: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

export const buildRestaurantSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Restaurant',
  name: siteMeta.brandName,
  description: siteMeta.description,
  servesCuisine: ['Ghanaian', 'West African'],
  areaServed: 'South London',
  hasMap: locations.map((location) => buildMapUrl(location.mapsQuery)),
  department: locations.map((location) => ({
    '@type': 'Restaurant',
    name: location.name,
    address: {
      '@type': 'PostalAddress',
      streetAddress: location.address,
      addressLocality: 'London',
      addressCountry: 'GB'
    },
    telephone: location.phoneLabel,
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      description: location.openingHoursPlaceholder
    }
  }))
});

export { buildMapUrl };
