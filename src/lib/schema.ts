import { locations, siteMeta } from '@/data/restaurant';

export const buildMapUrl = (query: string) =>
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

export const buildRestaurantSchema = () => ({
    '@context': 'https://schema.org',
    '@graph': [
      {
              '@type': 'Restaurant',
              '@id': 'https://www.agrobeso.org/#restaurant-peckham',
              name: 'Agrobeso – Peckham',
              description: siteMeta.description,
              url: 'https://www.agrobeso.org/',
              telephone: '+442077323721',
              servesCuisine: ['Ghanaian', 'West African', 'African'],
              priceRange: '££',
              currenciesAccepted: 'GBP',
              paymentAccepted: 'Cash, Credit Card',
              address: {
                        '@type': 'PostalAddress',
                        streetAddress: '139 Peckham High Street',
                        addressLocality: 'Peckham',
                        addressRegion: 'London',
                        postalCode: 'SE15 5SL',
                        addressCountry: 'GB',
              },
              geo: {
                        '@type': 'GeoCoordinates',
                        latitude: 51.4732,
                        longitude: -0.0698,
              },
              openingHoursSpecification: [
                {
                            '@type': 'OpeningHoursSpecification',
                            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                            opens: '12:00',
                            closes: '21:30',
                },
                      ],
              hasMap: buildMapUrl('139 Peckham High Street, Peckham SE15 5SL'),
              menu: 'https://www.agrobeso.org/#menu',
              acceptsReservations: true,
              image: 'https://kbopqzhfckbhkumiinmk.supabase.co/storage/v1/object/public/images/dish-jollof_rice-1778448765053.png',
              sameAs: ['https://www.instagram.com/agrobeso'],
      },
      {
              '@type': 'Restaurant',
              '@id': 'https://www.agrobeso.org/#restaurant-thornton-heath',
              name: 'Agrobeso – Thornton Heath',
              description: siteMeta.description,
              url: 'https://www.agrobeso.org/',
              telephone: '+442086846699',
              servesCuisine: ['Ghanaian', 'West African', 'African'],
              priceRange: '££',
              currenciesAccepted: 'GBP',
              paymentAccepted: 'Cash, Credit Card',
              address: {
                        '@type': 'PostalAddress',
                        streetAddress: '23 Brigstock Road',
                        addressLocality: 'Thornton Heath',
                        addressRegion: 'London',
                        postalCode: 'CR7 7JJ',
                        addressCountry: 'GB',
              },
              geo: {
                        '@type': 'GeoCoordinates',
                        latitude: 51.3994,
                        longitude: -0.1085,
              },
              openingHoursSpecification: [
                {
                            '@type': 'OpeningHoursSpecification',
                            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                            opens: '12:00',
                            closes: '21:30',
                },
                      ],
              hasMap: buildMapUrl('23 Brigstock Road, Thornton Heath CR7 7JJ'),
              menu: 'https://www.agrobeso.org/#menu',
              acceptsReservations: true,
              image: 'https://kbopqzhfckbhkumiinmk.supabase.co/storage/v1/object/public/images/dish-jollof_rice-1778448765053.png',
              sameAs: ['https://www.instagram.com/agrobeso'],
      },
      {
              '@type': 'WebSite',
              '@id': 'https://www.agrobeso.org/#website',
              url: 'https://www.agrobeso.org/',
              name: siteMeta.brandName,
              description: siteMeta.description,
              inLanguage: 'en-GB',
      },
      {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.agrobeso.org/' },
                { '@type': 'ListItem', position: 2, name: 'Menu', item: 'https://www.agrobeso.org/#menu' },
                { '@type': 'ListItem', position: 3, name: 'Locations', item: 'https://www.agrobeso.org/#locations' },
                { '@type': 'ListItem', position: 4, name: 'Reserve', item: 'https://www.agrobeso.org/reserve' },
                      ],
      },
        ],
});
