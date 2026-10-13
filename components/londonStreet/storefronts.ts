// Decorative shop signs, not a second source of restaurant details or recommendations.
export const SHOP_NAMES = [
  'Kopitiam', 'Kilin', 'CERU', 'YiQi', 'Lahpet', 'Vasiniko', 'ZIMA', 'Crudo', '遇见云南',
  '东园', 'Dishroom', 'Cheli', 'Arôme Bakery', 'Truedan', 'Gelupo', 'Nostos Coffee', 'Madura Kichen', 'Chef Javad Persian',
] as const;

const STANDALONE_SHOPS: readonly string[] = [
  'Crudo', 'Chef Javad Persian', 'Vasiniko', '遇见云南', 'Arôme Bakery', 'Kopitiam',
];

export function hasStandaloneShop( segment: number, side: number, bay: number )
{
  return SHOP_SLOTS.some( ( slot, index ) => slot.side === side && slot.bay === bay
    && STANDALONE_SHOPS.includes( SHOP_NAMES[ segment * SHOP_SLOTS.length + index ] ) );
}

export const SHOP_STYLES = [ 'fascia', 'hanging', 'awning' ] as const;
export const SHOP_SLUGS = [
  'med-salleh-kopitiam', 'kiln', 'ceru', 'yiqi', 'lahpet', 'vasiniko', 'zima', 'crudo', 'cloud-land',
  'dong-yuan', 'dishoom', 'cheli', 'arome-bakery', 'truedan', 'gelupo', 'nostos-coffee', 'madura-kitchen', 'chef-javad',
] as const;

export const shopHref = ( index: number ) => `/london/restaurants?restaurant=${SHOP_SLUGS[ index ]}`;
export const STREET_SEGMENT_LENGTH = 108;
export const STREET_LOOP_SECONDS = 36;

// Only ordinary buildings: landmark bays and their reserved gaps remain untouched.
export const SHOP_SLOTS = [
  { side: -1, bay: 0, offset: 0, width: 6.4 },
  { side: 1, bay: 0, offset: 0, width: 6.4 },
  { side: 1, bay: 2, offset: 2.3, width: 3.5 },
  { side: 1, bay: 2, offset: -2.3, width: 3.5 },
  { side: -1, bay: 4, offset: 2.3, width: 3.5 },
  { side: -1, bay: 4, offset: -2.3, width: 3.5 },
  { side: 1, bay: 4, offset: 0, width: 6.4 },
  { side: -1, bay: 6, offset: 0, width: 6.4 },
  { side: -1, bay: 7, offset: 0, width: 6.4 },
] as const;
