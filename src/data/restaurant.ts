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
    'Authentic Ghanaian and West African food in Peckham and Thornton Heath. Enjoy jollof rice, waakye, kenkey, banku, okra stew, peanut soup, fufu, fried fish, and more.'
};

export const heroContent = {
  headline: 'Authentic Ghanaian & West African Food in South London',
  subheadline:
    'Home-style dishes, bold flavours, generous portions, and warm hospitality from Peckham to Thornton Heath.'
};

export const locations: RestaurantLocation[] = [
  {
    id: 'peckham',
    name: 'Agrobeso African Cuisine',
    shortName: 'Peckham',
    address: '139 Peckham High St, London SE15 5SL',
    phoneLabel: 'Phone to be confirmed',
    phoneHref: '#',
    mapsQuery: '139 Peckham High St, London SE15 5SL',
    openingHoursPlaceholder: 'Opening hours placeholder: confirm directly with branch before launch.'
  },
  {
    id: 'thornton-heath',
    name: 'Agrobeso Thornton Heath',
    shortName: 'Thornton Heath',
    address: '23 Brigstock Rd, Thornton Heath CR7 7JJ',
    phoneLabel: '+44 20 8684 6699',
    phoneHref: 'tel:+442086846699',
    mapsQuery: '23 Brigstock Rd, Thornton Heath CR7 7JJ',
    openingHoursPlaceholder: 'Opening hours placeholder: listings conflict, verify before go-live.'
  }
];

export const signatureDishes = [
  'Jollof Rice',
  'Waakye',
  'Kenkey & Fish',
  'Banku & Okra Stew',
  'Peanut Soup',
  'Fufu / Pounded Yam',
  'Fried Fish / Tilapia',
  'Tuo Zaafi'
];

export const menuGroups = [
  {
    title: 'Rice dishes',
    items: ['Jollof rice combinations', 'Waakye plates', 'Fried rice selections']
  },
  {
    title: 'Soups and stews',
    items: ['Peanut soup', 'Light soup', 'Okra stew']
  },
  {
    title: 'Swallows and sides',
    items: ['Fufu', 'Pounded yam', 'Banku', 'Kenkey', 'Plantain and gari sides']
  },
  {
    title: 'Fish and meat dishes',
    items: ['Fried tilapia', 'Grilled fish', 'Goat and chicken options']
  },
  {
    title: 'Snacks and drinks',
    items: ['Puff puff and pastries', 'Soft drinks', 'Traditional refreshments']
  }
];
