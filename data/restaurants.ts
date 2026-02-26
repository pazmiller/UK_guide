export interface Restaurant {
  id: string;
  slug: string;
  name: string;
  cuisine: 'British' | 'Indian' | 'Italian' | 'Asian' | 'European' | 'Pub' | 'Eclectic';
  shortDescription: string;
  description: string;
  address: string;
  coordinates: { lat: number; lng: number };
  openingHours: string;
  priceRange: '£' | '££' | '£££' | '££££';
  rating: number;
  images: string[];
  website?: string;
  mustTry: string[];
}

export const restaurants: Restaurant[] = [
  {
    id: '1',
    slug: 'dishoom',
    name: 'Dishoom',
    cuisine: 'Indian',
    shortDescription: 'Bombay-style cafe inspired by the Irani cafes of 1960s Bombay',
    description: 'Dishoom pays loving homage to the Irani cafes that were once the heart of Bombay\'s social life. These cafes, opened by Zoroastrian immigrants from Iran in the early 1900s, served as meeting places for people from all walks of life. Dishoom recreates this atmosphere with meticulous attention to detail, from the vintage ceiling fans to the bentwood chairs. The food is exceptional, offering a range of small plates, grills, biryanis, and their legendary black daal that simmers for 24 hours.',
    address: '12 Upper St Martin\'s Lane, London WC2H 9FB',
    coordinates: { lat: 51.5117, lng: -0.1272 },
    openingHours: 'Mon-Thu: 8:00-23:00, Fri-Sat: 8:00-midnight, Sun: 9:00-23:00',
    priceRange: '££',
    rating: 4.7,
    images: [
      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800',
      'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800',
      'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?w=800'
    ],
    website: 'https://www.dishoom.com/',
    mustTry: ['Black Daal', 'Bacon Naan Roll', 'Lamb Biryani', 'Chicken Ruby']
  },
  {
    id: '2',
    slug: 'the-wolseley',
    name: 'The Wolseley',
    cuisine: 'European',
    shortDescription: 'Grand European cafe-restaurant in a stunning 1920s building',
    description: 'The Wolseley is a cafe-restaurant in the grand European tradition, located in a magnificent Grade II listed building on Piccadilly. Originally built in 1921 as a car showroom for Wolseley Motors, the building\'s stunning interior features soaring ceilings, black lacquer columns, and Japanese-inspired arches. The restaurant serves breakfast, lunch, afternoon tea, and dinner, offering a menu of European classics from wiener schnitzel to steak tartare.',
    address: '160 Piccadilly, St. James\'s, London W1J 9EB',
    coordinates: { lat: 51.5074, lng: -0.1422 },
    openingHours: 'Mon-Fri: 7:00-midnight, Sat: 8:00-midnight, Sun: 8:00-23:00',
    priceRange: '£££',
    rating: 4.5,
    images: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800',
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800'
    ],
    website: 'https://www.thewolseley.com/',
    mustTry: ['Wiener Schnitzel', 'Eggs Benedict', 'Kedgeree', 'Afternoon Tea']
  },
  {
    id: '3',
    slug: 'padella',
    name: 'Padella',
    cuisine: 'Italian',
    shortDescription: 'Hand-rolled pasta bar serving exceptional Italian dishes',
    description: 'Padella is a small pasta bar near Borough Market that has gained cult status for its hand-rolled pasta at remarkably affordable prices. The open kitchen lets you watch skilled chefs roll and shape pasta to order. Despite always having a queue (no reservations taken), the wait is worth it for dishes like the legendary pici cacio e pepe or the rich beef shin ragu pappardelle. The menu changes seasonally, ensuring there\'s always something new to discover.',
    address: '6 Southwark St, London SE1 1TQ',
    coordinates: { lat: 51.5052, lng: -0.0921 },
    openingHours: 'Mon-Sat: 12:00-22:00, Sun: 12:00-16:00',
    priceRange: '£',
    rating: 4.6,
    images: [
      'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800',
      'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800',
      'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800'
    ],
    website: 'https://www.padella.co/',
    mustTry: ['Pici Cacio e Pepe', 'Pappardelle with Beef Shin Ragu', 'Tagliarini with Dorset Crab']
  },
  {
    id: '4',
    slug: 'sketch',
    name: 'Sketch',
    cuisine: 'Eclectic',
    shortDescription: 'Art-filled destination for creative cuisine in whimsical spaces',
    description: 'Sketch is not just a restaurant but an immersive art experience spread across multiple uniquely designed spaces. The Gallery, with its pink velvet walls and David Shrigley artwork, serves modern European cuisine. The Lecture Room & Library holds two Michelin stars. The Glade is an enchanted forest-themed parlour. Even the egg-shaped toilets have become Instagram famous. Each visit to Sketch is a journey through art, design, and exceptional gastronomy.',
    address: '9 Conduit St, Mayfair, London W1S 2XG',
    coordinates: { lat: 51.5124, lng: -0.1410 },
    openingHours: 'Tue-Sat: 12:00-23:00',
    priceRange: '££££',
    rating: 4.4,
    images: [
      'https://images.unsplash.com/photo-1550966871-3ed3cdb51f3a?w=800',
      'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=800',
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800'
    ],
    website: 'https://sketch.london/',
    mustTry: ['Afternoon Tea at The Gallery', 'Tasting Menu at Lecture Room', 'Cocktails at The Parlour']
  },
  {
    id: '5',
    slug: 'flat-iron',
    name: 'Flat Iron',
    cuisine: 'British',
    shortDescription: 'No-frills steakhouse serving exceptional flat iron steaks',
    description: 'Flat Iron has revolutionized the London steakhouse scene by doing one thing exceptionally well: serving perfectly cooked flat iron steaks at an unbeatable price. The concept is simple - quality meat, cooked right, served in a relaxed setting. Every steak comes from grass-fed cattle, is dry-aged for 28 days, and served on a wooden board with a cleaver. The complimentary popcorn while you wait and free ice cream after your meal add to the experience.',
    address: '17 Beak St, Soho, London W1F 9RW',
    coordinates: { lat: 51.5124, lng: -0.1370 },
    openingHours: 'Mon-Sat: 12:00-22:30, Sun: 12:00-21:00',
    priceRange: '££',
    rating: 4.5,
    images: [
      'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=800',
      'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800',
      'https://images.unsplash.com/photo-1558030006-450675393462?w=800'
    ],
    website: 'https://flatironsteak.co.uk/',
    mustTry: ['Flat Iron Steak', 'Creamed Spinach', 'Dripping Fries', 'Salted Caramel Ice Cream']
  },
  {
    id: '6',
    slug: 'bao',
    name: 'BAO',
    cuisine: 'Asian',
    shortDescription: 'Taiwanese steamed buns and small plates in a hip setting',
    description: 'BAO started as a market stall and has grown into one of London\'s most beloved restaurant groups. Their signature fluffy bao buns are filled with everything from classic braised pork to fried chicken and confit pork. Beyond the buns, the menu features an array of Taiwanese small plates, noodles, and rice dishes. The restaurants have a cool, minimal aesthetic, and the food consistently delivers bold, authentic flavors that keep people queuing.',
    address: '53 Lexington St, Soho, London W1F 9AS',
    coordinates: { lat: 51.5131, lng: -0.1366 },
    openingHours: 'Mon-Wed: 12:00-15:00 & 17:30-22:00, Thu-Sat: 12:00-22:30',
    priceRange: '££',
    rating: 4.4,
    images: [
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800',
      'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800',
      'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800'
    ],
    website: 'https://baolondon.com/',
    mustTry: ['Classic Braised Pork Bao', 'Fried Chicken Bao', '40 Day Aged Beef Bao', 'Lamb Shoulder Rice Bowl']
  },
  {
    id: '7',
    slug: 'the-ivy',
    name: 'The Ivy',
    cuisine: 'British',
    shortDescription: 'Legendary restaurant serving modern British classics since 1917',
    description: 'The Ivy is a West End institution that has been serving the great and good of London since 1917. Famous for its celebrity clientele and stunning stained-glass windows, The Ivy offers a menu of modern British and international dishes. From the legendary Shepherd\'s Pie to the Thai-baked sea bass, the food is as memorable as the atmosphere. Despite its fame, The Ivy maintains an inclusive, welcoming atmosphere that makes everyone feel like a star.',
    address: '1-5 West St, London WC2H 9NQ',
    coordinates: { lat: 51.5120, lng: -0.1274 },
    openingHours: 'Mon-Sat: 12:00-23:30, Sun: 12:00-22:30',
    priceRange: '£££',
    rating: 4.3,
    images: [
      'https://images.unsplash.com/photo-1550966871-3ed3cdb51f3a?w=800',
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800',
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800'
    ],
    website: 'https://the-ivy.co.uk/',
    mustTry: ['Shepherd\'s Pie', 'Thai-Baked Sea Bass', 'Sticky Toffee Pudding', 'The Ivy Hamburger']
  },
  {
    id: '8',
    slug: 'duck-and-waffle',
    name: 'Duck & Waffle',
    cuisine: 'British',
    shortDescription: '24-hour restaurant on the 40th floor with stunning city views',
    description: 'Duck & Waffle offers a unique dining experience on the 40th floor of Heron Tower, with panoramic views of London. Open 24 hours, it\'s famous for serving breakfast at 3am with stunning night views or watching the sunrise over the city. The signature dish - a crispy duck leg confit with a fluffy waffle, fried duck egg, and mustard maple syrup - is indulgent perfection. The menu blends British and European influences with playful creativity.',
    address: 'Heron Tower, 110 Bishopsgate, London EC2N 4AY',
    coordinates: { lat: 51.5157, lng: -0.0811 },
    openingHours: '24 hours, 7 days a week',
    priceRange: '£££',
    rating: 4.4,
    images: [
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
      'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'
    ],
    website: 'https://duckandwaffle.com/',
    mustTry: ['Duck & Waffle', 'Ox Cheek Doughnut', 'Full English', 'Spicy Ox Cheek']
  },
  {
    id: '9',
    slug: 'gymkhana',
    name: 'Gymkhana',
    cuisine: 'Indian',
    shortDescription: 'Michelin-starred Indian restaurant inspired by colonial-era clubs',
    description: 'Gymkhana brings the spirit of the elite members\' clubs of India to Mayfair, serving refined Indian cuisine that has earned it a Michelin star. The interior evokes the gymkhana clubs where colonial Indians and British gathered, with dark wood paneling, ceiling fans, and hunting trophies. The menu features classic dishes elevated to new heights - tandoor grills, curries, and biryanis prepared with exceptional technique and ingredients.',
    address: '42 Albemarle St, Mayfair, London W1S 4JH',
    coordinates: { lat: 51.5092, lng: -0.1425 },
    openingHours: 'Mon-Sat: 12:00-14:30 & 17:30-22:30',
    priceRange: '££££',
    rating: 4.6,
    images: [
      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800',
      'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800',
      'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?w=800'
    ],
    website: 'https://www.gymkhanalondon.com/',
    mustTry: ['Kid Goat Methi Keema', 'Wild Muntjac Biryani', 'Tandoori Masala Lamb Chops', 'Dosa']
  },
  {
    id: '10',
    slug: 'ye-olde-cheshire-cheese',
    name: 'Ye Olde Cheshire Cheese',
    cuisine: 'Pub',
    shortDescription: 'Historic 17th-century pub rebuilt after the Great Fire of London',
    description: 'Ye Olde Cheshire Cheese is a historic pub rebuilt shortly after the Great Fire of London in 1666. This labyrinthine establishment, accessed through a narrow alley off Fleet Street, has served literary legends including Charles Dickens, Mark Twain, and Sir Arthur Conan Doyle. The dark, wood-paneled rooms with sawdust-covered floors transport you back centuries. While the atmosphere is the main draw, the pub serves traditional British fare including pies and fish & chips.',
    address: '145 Fleet St, London EC4A 2BU',
    coordinates: { lat: 51.5143, lng: -0.1074 },
    openingHours: 'Mon-Sat: 11:00-23:00, Sun: 12:00-19:00',
    priceRange: '££',
    rating: 4.2,
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800'
    ],
    website: undefined,
    mustTry: ['Steak and Ale Pie', 'Fish & Chips', 'Sunday Roast', 'Samuel Smith\'s Ale']
  }
];

export function getRestaurantBySlug(slug: string): Restaurant | undefined {
  return restaurants.find(r => r.slug === slug);
}

export function getRestaurantsByCuisine(cuisine: string): Restaurant[] {
  return restaurants.filter(r => r.cuisine === cuisine);
}
