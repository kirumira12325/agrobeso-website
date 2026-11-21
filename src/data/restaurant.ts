export type RestaurantLocation = {
  id: 'peckham' | 'thornton-heath';
  name: string;
  shortName: string;
  address: string;
  phoneLabel: string;
  phoneHref: string;
  mapsQuery: string;
  openingHoursPlaceholder: string;
};

export const siteMeta = {
  brandName: 'Agrobeso',
  title: 'Agrobeso | Authentic Ghanaian & West African Food in South London',
  description:
    'Authentic Ghanaian and West African food in Peckham and Thornton Heath. Enjoy jollof rice, waakye, kenkey, banku, okra stew, peanut soup, fufu, fried fish, and more.',
};

export const heroContent = {
  headline: 'Authentic Ghanaian & West African Food in South London',
  subheadline:
    'Home-style dishes, bold flavours, generous portions, and warm hospitality from Peckham to Thornton Heath.',
};

export const locations: RestaurantLocation[] = [
  {
    id: 'peckham',
    name: 'Agrobeso African Cuisine',
    shortName: 'Peckham',
    address: '139 Peckham High Street, London SE15 5SL',
    phoneLabel: '020 7732 3721',
    phoneHref: 'tel:+442077323721',
    mapsQuery: '139 Peckham High Street, Peckham SE15 5SL',
    openingHoursPlaceholder: 'Mon–Sun 12:00pm–9:30pm',
  },
  {
    id: 'thornton-heath',
    name: 'Agrobeso Thornton Heath',
    shortName: 'Thornton Heath',
    address: '23 Brigstock Road, Thornton Heath CR7 7JJ',
    phoneLabel: '020 8684 6699',
    phoneHref: 'tel:+442086846699',
    mapsQuery: '23 Brigstock Road, Thornton Heath CR7 7JJ',
    openingHoursPlaceholder: 'Mon–Sun 12:00pm–9:30pm',
  },
];

export const signatureDishes = [
  'Jollof Rice',
  'Waakye',
  'Kenkey & Fish',
  'Banku & Okra Stew',
  'Peanut Soup',
  'Fufu / Pounded Yam',
  'Fried Fish / Tilapia',
  'Tuo Zaafi',
];

export const menuGroups = [
  {
    title: 'Rice dishes',
    items: ['Jollof rice combinations', 'Waakye plates', 'Fried rice selections'],
  },
  {
    title: 'Soups and stews',
    items: ['Peanut soup', 'Light soup', 'Okra stew'],
  },
  {
    title: 'Swallows and sides',
    items: ['Fufu', 'Pounded yam', 'Banku', 'Kenkey', 'Plantain and gari sides'],
  },
  {
    title: 'Fish and meat dishes',
    items: ['Fried tilapia', 'Grilled fish', 'Goat and chicken options'],
  },
  {
    title: 'Snacks and drinks',
    items: ['Puff puff and pastries', 'Soft drinks', 'Traditional refreshments'],
  },
];

/** Per-location copy for the dedicated /peckham and /thornton-heath pages. */
export const locationPages: Record<RestaurantLocation['id'], {
  seoTitle: string;
  seoDescription: string;
  h1: string;
  intro: string;
  neighbourhood: string;
  gettingHere: string[];
  lat: number;
  lng: number;
}> = {
  peckham: {
    seoTitle: 'Ghanaian Restaurant in Peckham | Agrobeso African Cuisine, SE15',
    seoDescription:
      'Agrobeso on Peckham High Street serves authentic Ghanaian & West African food – jollof rice, waakye, banku & okra stew, fufu, grilled tilapia. Open daily 12–9:30pm. Book a table.',
    h1: 'Ghanaian & West African restaurant in Peckham',
    intro:
      'Our original kitchen on Peckham High Street has been feeding South London the dishes we grew up on: slow-simmered jollof, smoky banku with okra stew, hand-pounded fufu and whole tilapia fried to order. Come for lunch, a long Sunday afternoon, or takeaway on the way home.',
    neighbourhood:
      'We sit at the heart of Peckham High Street, a few minutes’ walk from Peckham Rye and Queens Road Peckham stations and surrounded by one of London’s great African food communities. Expect generous portions, proper pepper, and a table that feels like home.',
    gettingHere: [
      'Rail & Overground: Peckham Rye (c. 5 min walk) and Queens Road Peckham (c. 8 min walk).',
      'Bus: routes 12, 36, 171, 345 and 436 stop on Peckham High Street.',
      'Parking: pay-and-display on surrounding streets; the Aylesham Centre car park is nearby.',
    ],
    lat: 51.4732,
    lng: -0.0698,
  },
  'thornton-heath': {
    seoTitle: 'Ghanaian Restaurant in Thornton Heath | Agrobeso, Brigstock Road CR7',
    seoDescription:
      'Agrobeso Thornton Heath on Brigstock Road – authentic Ghanaian & West African food near Croydon. Jollof, waakye, peanut soup, fufu, kenkey & fried fish. Open daily 12–9:30pm.',
    h1: 'Ghanaian & West African restaurant in Thornton Heath',
    intro:
      'Our Thornton Heath kitchen on Brigstock Road brings the same slow-cooked soups, seasoned rice and grilled fish to the Croydon side of South London. Dine in with family, call ahead for takeaway, or book a table for a group.',
    neighbourhood:
      'Brigstock Road is a short walk from Thornton Heath station and the High Street, with easy access from Croydon, Norbury and Streatham. It is a neighbourhood restaurant in the true sense: regulars, big plates and a kitchen that cooks the way home does.',
    gettingHere: [
      'Rail: Thornton Heath station (c. 4 min walk) – direct trains from London Victoria and London Bridge.',
      'Bus: routes 50, 60, 64, 109, 198 and 250 stop nearby.',
      'Parking: on-street parking on Brigstock Road and surrounding roads (check restrictions).',
    ],
    lat: 51.3994,
    lng: -0.1085,
  },
};

/** Short descriptions for the signature dishes, used on /menu. */
export const dishDescriptions: Record<string, string> = {
  'Jollof Rice': 'Long-grain rice slow-simmered in tomato, scotch bonnet and bay – the dish of every Ghanaian celebration.',
  'Waakye': 'Rice and beans cooked with sorghum leaves for their deep colour, served with shito and fried plantain.',
  'Kenkey & Fish': 'Fermented corn dough, steamed and paired with grilled tilapia, fresh pepper sauce and shito.',
  'Banku & Okra Stew': 'Smooth, gently sour banku alongside okra stew braised low with smoked fish and spice.',
  'Peanut Soup': 'Groundnut paste, tomato, ginger and slow-cooked goat – nkate nkwan, the cold-evening cure.',
  'Fufu / Pounded Yam': 'Cassava and plantain pounded fresh to a soft, elastic round. Served with light soup or peanut soup.',
  'Fried Fish / Tilapia': 'Whole tilapia scored, marinated and fried until the skin crisps. Served with banku or kenkey.',
  'Tuo Zaafi': 'A northern Ghanaian staple of soft millet or maize meal with a leafy green ayoyo sauce.',
};
