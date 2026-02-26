export interface Attraction
{
  id: string;
  slug: string;
  name: string;
  category: 'Historical' | 'Parks' | 'Museums' | 'Markets' | 'Landmarks';
  shortDescription: string;
  description: string;
  address: string;
  coordinates: { lat: number; lng: number };
  openingHours: string;
  price: string;
  images: string[];
  website?: string;
}

export const attractions: Attraction[] = [
  {
    id: '1',
    slug: 'tower-of-london',
    name: '伦敦塔 Tower of London',
    category: 'Historical',
    shortDescription: 'Historic castle and fortress on the north bank of the River Thames',
    description: 'The Tower of London is a historic castle and fortress located on the north bank of the River Thames in central London. Founded in 1066 as part of the Norman Conquest, it has served as a royal palace, prison, armory, treasury, and even a zoo. Today, it houses the Crown Jewels and is one of the most visited attractions in the UK. The iconic Yeoman Warders, known as Beefeaters, guard the tower and lead engaging tours sharing centuries of history and intrigue.',
    address: 'Tower of London, London EC3N 4AB',
    coordinates: { lat: 51.5081, lng: -0.0759 },
    openingHours: 'Tue-Sat: 9:00-17:30, Sun-Mon: 10:00-17:30',
    price: 'Adults: £29.90, Children: £14.90',
    images: [
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800',
      'https://images.unsplash.com/photo-1526129318478-62ed807ebdf9?w=800',
      'https://images.unsplash.com/photo-1520986606214-8b456906c813?w=800'
    ],
    website: 'https://www.hrp.org.uk/tower-of-london/'
  },
  {
    id: '2',
    slug: 'british-museum',
    name: '大英博物馆 British Museum',
    category: 'Museums',
    shortDescription: 'World-famous museum with artifacts spanning two million years of history',
    description: 'The British Museum is one of the largest and most comprehensive museums in the world, dedicated to human history, art, and culture. Its permanent collection numbers over 8 million works, spanning the story of human civilization from its beginnings to the present. Highlights include the Rosetta Stone, the Parthenon sculptures, Egyptian mummies, and the Sutton Hoo treasure. The magnificent Great Court, designed by Norman Foster, is the largest covered public square in Europe.',
    address: 'Great Russell St, London WC1B 3DG',
    coordinates: { lat: 51.5194, lng: -0.1270 },
    openingHours: 'Daily: 10:00-17:00, Fridays until 20:30',
    price: 'Free (donations welcome)',
    images: [
      'https://images.unsplash.com/photo-1590099033615-be195f8d575c?w=800',
      'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=800',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'
    ],
    website: 'https://www.britishmuseum.org/'
  },
  {
    id: '3',
    slug: 'buckingham-palace',
    name: '白金汉宫 Buckingham Palace',
    category: 'Landmarks',
    shortDescription: 'Official residence of the British monarch and administrative headquarters',
    description: 'Buckingham Palace has served as the official London residence of the UK\'s sovereigns since 1837. With 775 rooms, it is a working royal palace and the administrative headquarters of the Monarch. The famous Changing of the Guard ceremony takes place in the forecourt. During summer months, visitors can tour the magnificent State Rooms, which are lavishly furnished with some of the greatest treasures from the Royal Collection.',
    address: 'London SW1A 1AA',
    coordinates: { lat: 51.5014, lng: -0.1419 },
    openingHours: 'Summer months only: 9:30-19:30',
    price: 'Adults: £30, Under 17: £16.50',
    images: [
      'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=800',
      'https://images.unsplash.com/photo-1587385789097-0197a7fbd179?w=800',
      'https://images.unsplash.com/photo-1470019693664-1d202d2c0907?w=800'
    ],
    website: 'https://www.rct.uk/visit/buckingham-palace'
  },
  {
    id: '4',
    slug: 'big-ben',
    name: '大本钟 Big Ben & Houses of Parliament',
    category: 'Landmarks',
    shortDescription: 'Iconic clock tower and the seat of UK Parliament',
    description: 'Big Ben is the nickname for the Great Bell of the clock at the north end of the Palace of Westminster, though it is commonly used to refer to the entire clock tower. The Elizabeth Tower, as it is officially known, stands at 96 meters tall and has become one of the most prominent symbols of both London and the United Kingdom. The adjacent Houses of Parliament, officially the Palace of Westminster, is where the House of Commons and House of Lords meet to debate and pass laws.',
    address: 'Westminster, London SW1A 0AA',
    coordinates: { lat: 51.5007, lng: -0.1246 },
    openingHours: 'Tours available, booking required',
    price: 'UK residents: Free, International: £28',
    images: [
      'https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=800',
      'https://images.unsplash.com/photo-1529180184525-78f99adb8e98?w=800',
      'https://images.unsplash.com/photo-1494145904049-0dca59b4bbad?w=800'
    ],
    website: 'https://www.parliament.uk/visiting/'
  },
  {
    id: '5',
    slug: 'london-eye',
    name: '伦敦眼 London Eye',
    category: 'Landmarks',
    shortDescription: 'Giant observation wheel offering panoramic views of London',
    description: 'The London Eye is a cantilevered observation wheel on the South Bank of the River Thames. At 135 meters, it is the tallest cantilevered observation wheel in Europe and the most popular paid tourist attraction in the United Kingdom. A rotation takes about 30 minutes, during which visitors can enjoy stunning 360-degree views of the city\'s landmarks including Big Ben, Buckingham Palace, and St Paul\'s Cathedral.',
    address: 'Riverside Building, County Hall, London SE1 7PB',
    coordinates: { lat: 51.5033, lng: -0.1196 },
    openingHours: 'Daily: 10:00-21:00 (varies seasonally)',
    price: 'Adults from £32, Children from £27',
    images: [
      'https://images.unsplash.com/photo-1543832923-44667a44c804?w=800',
      'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=800',
      'https://images.unsplash.com/photo-1520986606214-8b456906c813?w=800'
    ],
    website: 'https://www.londoneye.com/'
  },
  {
    id: '6',
    slug: 'tower-bridge',
    name: '塔桥 Tower Bridge',
    category: 'Landmarks',
    shortDescription: 'Victorian combined bascule and suspension bridge',
    description: 'Tower Bridge is a combined bascule and suspension bridge crossing the River Thames, close to the Tower of London. Built between 1886 and 1894, it has become an iconic symbol of London. The bridge\'s high-level walkways, now featuring glass floors, offer spectacular views of the city. The Tower Bridge Exhibition allows visitors to explore the bridge\'s Victorian engine rooms and learn about the history of this engineering marvel.',
    address: 'Tower Bridge Rd, London SE1 2UP',
    coordinates: { lat: 51.5055, lng: -0.0754 },
    openingHours: 'Daily: 9:30-18:00',
    price: 'Adults: £12.30, Children: £6.20',
    images: [
      'https://images.unsplash.com/photo-1471874276752-65e2d717604a?w=800',
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800',
      'https://images.unsplash.com/photo-1574268677492-c54ec99b0e4c?w=800'
    ],
    website: 'https://www.towerbridge.org.uk/'
  },
  {
    id: '7',
    slug: 'hyde-park',
    name: '海德公园 Hyde Park',
    category: 'Parks',
    shortDescription: 'One of London\'s largest Royal Parks, perfect for relaxation',
    description: 'Hyde Park is one of the largest parks in London and one of the Royal Parks. It is famous for its Speakers\' Corner, where people have gathered to speak freely since 1872. The park features the Serpentine lake, the Diana Princess of Wales Memorial Fountain, and beautiful gardens. It hosts major concerts and events, including the famous Winter Wonderland during the Christmas season. Perfect for boating, swimming, cycling, or simply enjoying a peaceful stroll.',
    address: 'Hyde Park, London W2 2UH',
    coordinates: { lat: 51.5073, lng: -0.1657 },
    openingHours: 'Daily: 5:00-midnight',
    price: 'Free',
    images: [
      'https://images.unsplash.com/photo-1524488417148-c13d19c5e3d3?w=800',
      'https://images.unsplash.com/photo-1517394834181-95ed159986c7?w=800',
      'https://images.unsplash.com/photo-1588704487659-3a05f08a9c06?w=800'
    ],
    website: 'https://www.royalparks.org.uk/parks/hyde-park'
  },
  {
    id: '8',
    slug: 'borough-market',
    name: '博罗市场 Borough Market',
    category: 'Markets',
    shortDescription: 'London\'s most renowned food market with over 1000 years of history',
    description: 'Borough Market is one of the oldest and largest food markets in London, with a history dating back over 1,000 years. Located near London Bridge, it offers an incredible variety of artisan foods, fresh produce, and street food from around the world. The market is a food lover\'s paradise, featuring everything from British cheeses and fresh seafood to exotic spices and gourmet baked goods. It\'s also appeared in numerous films, including Harry Potter.',
    address: '8 Southwark St, London SE1 1TL',
    coordinates: { lat: 51.5055, lng: -0.0910 },
    openingHours: 'Mon-Thu: 10:00-17:00, Fri: 10:00-18:00, Sat: 8:00-17:00',
    price: 'Free entry',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
      'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=800',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800'
    ],
    website: 'https://boroughmarket.org.uk/'
  },
  {
    id: '9',
    slug: 'westminster-abbey',
    name: '威斯敏斯特大教堂 Westminster Abbey',
    category: 'Historical',
    shortDescription: 'Gothic abbey church and site of royal coronations since 1066',
    description: 'Westminster Abbey is a large, mainly Gothic abbey church in Westminster. It is one of the most notable religious buildings in the United Kingdom and has been the traditional place of coronation and burial site for English and British monarchs. The current church was built in 1245 by Henry III and has hosted every coronation since 1066, as well as numerous royal weddings. Notable figures buried here include Isaac Newton, Charles Darwin, and Geoffrey Chaucer.',
    address: '20 Deans Yd, London SW1P 3PA',
    coordinates: { lat: 51.4994, lng: -0.1273 },
    openingHours: 'Mon-Sat: 9:30-15:30',
    price: 'Adults: £27, Children 6-17: £12',
    images: [
      'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=800',
      'https://images.unsplash.com/photo-1579282240050-352db0a14c21?w=800',
      'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?w=800'
    ],
    website: 'https://www.westminster-abbey.org/'
  },
  {
    id: '10',
    slug: 'the-shard',
    name: 'Horizon 22',
    category: 'Landmarks',
    shortDescription: 'Western Europe\'s tallest building with stunning viewing platforms',
    description: 'The Shard is a 95-story skyscraper in Southwark, standing at 310 meters tall. It is the tallest building in the United Kingdom and Western Europe. The View from The Shard, located on floors 68-72, offers breathtaking 360-degree views of London up to 40 miles in every direction. The building also houses luxury offices, restaurants, the Shangri-La hotel, and exclusive residences, making it a vertical city within the city.',
    address: '32 London Bridge St, London SE1 9SG',
    coordinates: { lat: 51.5045, lng: -0.0865 },
    openingHours: 'Daily: 10:00-22:00',
    price: 'Adults from £32, Children from £26',
    images: [
      'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=800',
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800',
      'https://images.unsplash.com/photo-1520986606214-8b456906c813?w=800'
    ],
    website: 'https://www.theviewfromtheshard.com/'
  }
];

export function getAttractionBySlug( slug: string ): Attraction | undefined
{
  return attractions.find( a => a.slug === slug );
}

export function getAttractionsByCategory( category: string ): Attraction[]
{
  return attractions.filter( a => a.category === category );
}
