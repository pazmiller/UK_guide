'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import millerIcon from '@/src/img/miller_icon.png';
import styles from './FurconIndex.module.css';

export type Region = 'north-america' | 'europe' | 'asia-pacific' | 'latin-america';
export type RegionFilter = Region | 'all' | 'uk';

type Furcon = {
  name: string;
  dates: string;
  venue: string;
  place: string;
  country: string;
  region: Region;
  start: string;
  end: string;
  days: number;
  cancelled: boolean;
};

export type VerifiedFurcon = Furcon & {
  officialUrl: string;
  lastVerified: string;
};

const DATA: Furcon[] = [ { "name": "Futerkon 2026", "dates": "July 29 - August 2, 2026", "venue": "Centrum Konferencyjno Szkoleniowe Ossa", "place": "Ossa, Poland", "country": "Poland", "region": "europe", "start": "2026-07-29", "end": "2026-08-02", "days": 5, "cancelled": false }, { "name": "Anthro Weekend Utah 2026", "dates": "July 31 - August 2, 2026", "venue": "Davis Conference Center", "place": "Layton, UT", "country": "United States", "region": "north-america", "start": "2026-07-31", "end": "2026-08-02", "days": 3, "cancelled": false }, { "name": "Osaka Furry Fun Festa 2026", "dates": "August 1-2, 2026", "venue": "INTEX Osaka", "place": "Osaka, Japan", "country": "Japan", "region": "asia-pacific", "start": "2026-08-01", "end": "2026-08-02", "days": 2, "cancelled": false }, { "name": "East 2026", "dates": "August 5-9, 2026", "venue": "Ringberghaus", "place": "Suhl, Germany", "country": "Germany", "region": "europe", "start": "2026-08-05", "end": "2026-08-09", "days": 5, "cancelled": false }, { "name": "Furrydelphia 2026", "dates": "August 6-9, 2026", "venue": "Sheraton Downtown Philadelphia", "place": "Philadelphia, PA", "country": "United States", "region": "north-america", "start": "2026-08-06", "end": "2026-08-09", "days": 4, "cancelled": false }, { "name": "CanFURence 2026", "dates": "August 7-9, 2026", "venue": "Ottawa Conference and Event Centre", "place": "Ottawa, Ontario, Canada", "country": "Canada", "region": "north-america", "start": "2026-08-07", "end": "2026-08-09", "days": 3, "cancelled": false }, { "name": "Tails of Summer 2026", "dates": "August 8-9, 2026", "venue": "Executive Hotel Vancouver Airport", "place": "Richmond, British Columbia, Canada", "country": "Canada", "region": "north-america", "start": "2026-08-08", "end": "2026-08-09", "days": 2, "cancelled": false }, { "name": "Bratislava FurFest 2026", "dates": "August 10, 2026", "venue": "Youth Hub (Bratislavská Platforma Mladých)", "place": "Bratislava, Slovakia", "country": "Slovakia", "region": "europe", "start": "2026-08-10", "end": "2026-08-10", "days": 1, "cancelled": false }, { "name": "Dutch FurCon 2026", "dates": "August 14-17, 2026", "venue": "Vakantiepark de Oude Molen", "place": "Groesbeek, Netherlands", "country": "Netherlands", "region": "europe", "start": "2026-08-14", "end": "2026-08-17", "days": 4, "cancelled": false }, { "name": "FUVE 2026", "dates": "August 15, 2026", "venue": "Eastin Grand Hotel Saigon", "place": "Hồ Chí Minh, Vietnam", "country": "Vietnam", "region": "asia-pacific", "start": "2026-08-15", "end": "2026-08-15", "days": 1, "cancelled": false }, { "name": "Eurofurence 2026", "dates": "August 19-23, 2026", "venue": "Congress Center Hamburg", "place": "Hamburg, Germany", "country": "Germany", "region": "europe", "start": "2026-08-19", "end": "2026-08-23", "days": 5, "cancelled": false }, { "name": "Megaplex 2026", "dates": "August 21-23, 2026", "venue": "Hyatt Regency Orlando", "place": "Orlando, FL", "country": "United States", "region": "north-america", "start": "2026-08-21", "end": "2026-08-23", "days": 3, "cancelled": false }, { "name": "Pawstral 2026", "dates": "August 21-23, 2026", "venue": "Le Méridien Santiago", "place": "Santiago, Chile", "country": "Chile", "region": "latin-america", "start": "2026-08-21", "end": "2026-08-23", "days": 3, "cancelled": false }, { "name": "StratosFur 2026", "dates": "August 27-30, 2026", "venue": "Houston Marriott Westchase", "place": "Houston, TX", "country": "United States", "region": "north-america", "start": "2026-08-27", "end": "2026-08-30", "days": 4, "cancelled": false }, { "name": "Aberacon 2026", "dates": "August 28-30, 2026", "venue": "Best Western Aberavon Beach Hotel", "place": "Port Talbot, UK", "country": "UK", "region": "europe", "start": "2026-08-28", "end": "2026-08-30", "days": 3, "cancelled": false }, { "name": "DenFur 2026", "dates": "August 28-30, 2026", "venue": "Sheraton Denver Downtown Hotel", "place": "Denver, CO", "country": "United States", "region": "north-america", "start": "2026-08-28", "end": "2026-08-30", "days": 3, "cancelled": false }, { "name": "FursonaCon 2026", "dates": "September 3-6, 2026", "venue": "Newport News Marriott at City Center", "place": "Newport News, VA", "country": "United States", "region": "north-america", "start": "2026-09-03", "end": "2026-09-06", "days": 4, "cancelled": false }, { "name": "IndyFurCon 2026", "dates": "September 3-6, 2026", "venue": "Hyatt Regency Indianapolis", "place": "Indianapolis, IN", "country": "United States", "region": "north-america", "start": "2026-09-03", "end": "2026-09-06", "days": 4, "cancelled": false }, { "name": "Calfurry 2026", "dates": "September 4-6, 2026", "venue": "The Glenmore Inn & Convention Centre", "place": "Calgary, Alberta, Canada", "country": "Canada", "region": "north-america", "start": "2026-09-04", "end": "2026-09-06", "days": 3, "cancelled": false }, { "name": "Mephit Fur Meet 2026", "dates": "September 4-6, 2026", "venue": "Memphis Vitality Hotel", "place": "Memphis, TN", "country": "United States", "region": "north-america", "start": "2026-09-04", "end": "2026-09-06", "days": 3, "cancelled": false }, { "name": "Tails and Tornadoes Fur Con 2026", "dates": "September 4-6, 2026", "venue": "Renaissance Tulsa Hotel & Convention Center", "place": "Tulsa, OK", "country": "United States", "region": "north-america", "start": "2026-09-04", "end": "2026-09-06", "days": 3, "cancelled": false }, { "name": "Barkada FurFest 2026", "dates": "September 5-6, 2026", "venue": "Sequoia Hotel Manila Bay", "place": "Paranaque City, Metro Manila, Philippines", "country": "Philippines", "region": "asia-pacific", "start": "2026-09-05", "end": "2026-09-06", "days": 2, "cancelled": false }, { "name": "Furdance Budapest 2026", "dates": "September 11-13, 2026", "venue": "Csokonai Kulturális Központ", "place": "Budapest, Hungary", "country": "Hungary", "region": "europe", "start": "2026-09-11", "end": "2026-09-13", "days": 3, "cancelled": false }, { "name": "Furry Migration 2026", "dates": "September 11-13, 2026", "venue": "Hyatt Regency Minneapolis", "place": "Minneapolis, MN", "country": "United States", "region": "north-america", "start": "2026-09-11", "end": "2026-09-13", "days": 3, "cancelled": false }, { "name": "Anthro SoCal 2026", "dates": "September 18-20, 2026", "venue": "Ontario Convention Center", "place": "Ontario, CA", "country": "United States", "region": "north-america", "start": "2026-09-18", "end": "2026-09-20", "days": 3, "cancelled": false }, { "name": "Furever West 2026", "dates": "September 18-20, 2026", "venue": "Hilton Garden Inn Laramie", "place": "Laramie, WY", "country": "United States", "region": "north-america", "start": "2026-09-18", "end": "2026-09-20", "days": 3, "cancelled": true }, { "name": "Wild North 2026", "dates": "September 18-21, 2026", "venue": "Lumley Castle", "place": "Chester-le-Street, UK", "country": "UK", "region": "europe", "start": "2026-09-18", "end": "2026-09-21", "days": 4, "cancelled": false }, { "name": "FurGIV 2026", "dates": "September 19, 2026", "venue": "Grand Vista Hotel", "place": "Ha Noi, Vietnam", "country": "Vietnam", "region": "asia-pacific", "start": "2026-09-19", "end": "2026-09-19", "days": 1, "cancelled": false }, { "name": "Furrest City 2026", "dates": "September 19-20, 2026", "venue": "Cleveland State University Student Center", "place": "Cleveland, OH", "country": "United States", "region": "north-america", "start": "2026-09-19", "end": "2026-09-20", "days": 2, "cancelled": false }, { "name": "Furry Takeover 2026", "dates": "September 25-27, 2026", "venue": "Fontana Village Resort & Marina", "place": "Fontana Dam, NC", "country": "United States", "region": "north-america", "start": "2026-09-25", "end": "2026-09-27", "days": 3, "cancelled": false }, { "name": "FurCalvaDance 2026", "dates": "September 25-29, 2026", "venue": "Village de vacances VTF Le Sénéquet", "place": "Blainville-sur-Mer, France", "country": "France", "region": "europe", "start": "2026-09-25", "end": "2026-09-29", "days": 5, "cancelled": false }, { "name": "H-Con 2026", "dates": "September 30 - October 4, 2026", "venue": "Petershof", "place": "Erbach, Germany", "country": "Germany", "region": "europe", "start": "2026-09-30", "end": "2026-10-04", "days": 5, "cancelled": false }, { "name": "Alamo City Furry Invasion 2026", "dates": "October 1-4, 2026", "venue": "Embassy Suites by Hilton San Marcos Hotel Conference Center", "place": "San Marcos, TX", "country": "United States", "region": "north-america", "start": "2026-10-01", "end": "2026-10-04", "days": 4, "cancelled": false }, { "name": "Carolina Furfare 2026", "dates": "October 1-4, 2026", "venue": "Hickory Metro Convention Center", "place": "Hickory, NC", "country": "United States", "region": "north-america", "start": "2026-10-01", "end": "2026-10-04", "days": 4, "cancelled": false }, { "name": "Michigan Anthro Weekend 2026", "dates": "October 1-4, 2026", "venue": "Sheraton Grand Rapids Airport Hotel", "place": "Grand Rapids, MI", "country": "United States", "region": "north-america", "start": "2026-10-01", "end": "2026-10-04", "days": 4, "cancelled": false }, { "name": "Pawsome 2026", "dates": "October 1-5, 2026", "venue": "Mercure Gloucester Bowden Hall Hotel", "place": "Gloucester, UK", "country": "UK", "region": "europe", "start": "2026-10-01", "end": "2026-10-05", "days": 5, "cancelled": false }, { "name": "Western PA Furry Weekend 2026", "dates": "October 2-4, 2026", "venue": "North Park Lodge", "place": "Allison Park, PA", "country": "United States", "region": "north-america", "start": "2026-10-02", "end": "2026-10-04", "days": 3, "cancelled": false }, { "name": "Party Along With Anthro Indonesia 2026", "dates": "October 3-4, 2026", "venue": "Grand Istana Rama Hotel Kuta - Bali", "place": "Kuta, Kabupaten Badung, Bali, Indonesia", "country": "Indonesia", "region": "asia-pacific", "start": "2026-10-03", "end": "2026-10-04", "days": 2, "cancelled": false }, { "name": "Anthro Party Argentina! 2026", "dates": "October 9-11, 2026", "venue": "Hotel Quinto Centenario", "place": "Córdoba, Argentina", "country": "Argentina", "region": "latin-america", "start": "2026-10-09", "end": "2026-10-11", "days": 3, "cancelled": false }, { "name": "AquatiFur 2026", "dates": "October 9-11, 2026", "venue": "Chula Vista Resort - Wisconsin Dells Waterpark Resort", "place": "Wisconsin Dells, WI", "country": "United States", "region": "north-america", "start": "2026-10-09", "end": "2026-10-11", "days": 3, "cancelled": false }, { "name": "Heartland Howloween 2026", "dates": "October 9-11, 2026", "venue": "DoubleTree by Hilton Hotel Omaha Downtown", "place": "Omaha, NE", "country": "United States", "region": "north-america", "start": "2026-10-09", "end": "2026-10-11", "days": 3, "cancelled": false }, { "name": "Biggest Little Fur Con 2026", "dates": "October 12-15, 2026", "venue": "Grand Sierra Resort and Casino", "place": "Reno, NV", "country": "United States", "region": "north-america", "start": "2026-10-12", "end": "2026-10-15", "days": 4, "cancelled": false }, { "name": "Gateway FurMeet 2026", "dates": "October 16-18, 2026", "venue": "Hilton St. Louis at the Ballpark", "place": "St. Louis, MO", "country": "United States", "region": "north-america", "start": "2026-10-16", "end": "2026-10-18", "days": 3, "cancelled": false }, { "name": "Furry Cruise 2026", "dates": "October 18-25, 2026", "venue": "Norwegian Prima", "place": "Departing from Port Canaveral, FL", "country": "United States", "region": "north-america", "start": "2026-10-18", "end": "2026-10-25", "days": 8, "cancelled": false }, { "name": "Spooktacufur 2026", "dates": "October 24, 2026", "venue": "Hilton Salt Lake City Center", "place": "Salt Lake City, UT", "country": "United States", "region": "north-america", "start": "2026-10-24", "end": "2026-10-24", "days": 1, "cancelled": false }, { "name": "Furnavia 2026", "dates": "October 27-31, 2026", "venue": "Quality Hotel Sarpsborg", "place": "Grålum, Norway", "country": "Norway", "region": "europe", "start": "2026-10-27", "end": "2026-10-31", "days": 5, "cancelled": false }, { "name": "Furry Blacklight 2026", "dates": "October 28 - November 1, 2026", "venue": "H4 Hotel Wyndham Paris Pleyel Resort", "place": "Saint-Denis, France", "country": "France", "region": "europe", "start": "2026-10-28", "end": "2026-11-01", "days": 5, "cancelled": false }, { "name": "Furry Retreat 2026", "dates": "October 28 - November 2, 2026", "venue": "Robbers Cave State Park", "place": "Wilburton, OK", "country": "United States", "region": "north-america", "start": "2026-10-28", "end": "2026-11-02", "days": 6, "cancelled": false }, { "name": "Confuror 2026", "dates": "October 29 - November 1, 2026", "venue": "Expo Guadalajara", "place": "Guadalajara, JAL, Mexico", "country": "Mexico", "region": "latin-america", "start": "2026-10-29", "end": "2026-11-01", "days": 4, "cancelled": false }, { "name": "Furpocalypse 2026", "dates": "October 29 - November 1, 2026", "venue": "DoubleTree by Hilton Stamford", "place": "Stamford, CT", "country": "United States", "region": "north-america", "start": "2026-10-29", "end": "2026-11-01", "days": 4, "cancelled": false }, { "name": "Infurnity 2026", "dates": "October 30 - November 1, 2026", "venue": "Fullon Hotel Lihpao Land", "place": "Taichung City, Taiwan", "country": "Taiwan", "region": "asia-pacific", "start": "2026-10-30", "end": "2026-11-01", "days": 3, "cancelled": false }, { "name": "Wüellas FurFest 2026", "dates": "October 30 - November 1, 2026", "venue": "Radisson Blu Plaza El Bosque Santiago", "place": "Santiago, Las Condes, Chile", "country": "Chile", "region": "latin-america", "start": "2026-10-30", "end": "2026-11-01", "days": 3, "cancelled": false }, { "name": "Wild Furloween West 2026", "dates": "October 30 - November 1, 2026", "venue": "DoubleTree by Hilton Fort Worth South Hotel & Conference Center", "place": "Fort Worth, TX", "country": "United States", "region": "north-america", "start": "2026-10-30", "end": "2026-11-01", "days": 3, "cancelled": false }, { "name": "GoldenHorn 2026", "dates": "November 5-8, 2026", "venue": "Hotel Slovenija", "place": "Portorož, Slovenia", "country": "Slovenia", "region": "europe", "start": "2026-11-05", "end": "2026-11-08", "days": 4, "cancelled": false }, { "name": "PAWCon 2026", "dates": "November 6-8, 2026", "venue": "DoubleTree by Hilton Hotel San Jose", "place": "San Jose, CA", "country": "United States", "region": "north-america", "start": "2026-11-06", "end": "2026-11-08", "days": 3, "cancelled": false }, { "name": "Adelaide Anthros 2026", "dates": "November 7-8, 2026", "venue": "Oaks Glenelg Plaza Pier Suites", "place": "Glenelg, South Australia, Australia", "country": "Australia", "region": "asia-pacific", "start": "2026-11-07", "end": "2026-11-08", "days": 2, "cancelled": false }, { "name": "Flüüfff 2026", "dates": "November 11-15, 2026", "venue": "Mercure Antwerp City South", "place": "Antwerp, Belgium", "country": "Belgium", "region": "europe", "start": "2026-11-11", "end": "2026-11-15", "days": 5, "cancelled": false }, { "name": "Futrołajki 2026", "dates": "November 11-15, 2026", "venue": "Grand Hotel Kielce", "place": "Kielce, Poland", "country": "Poland", "region": "europe", "start": "2026-11-11", "end": "2026-11-15", "days": 5, "cancelled": false }, { "name": "Furcation 2026", "dates": "November 20-22, 2026", "venue": "Sandy Glade Holiday Park", "place": "Burham-on-Sea, UK", "country": "UK", "region": "europe", "start": "2026-11-20", "end": "2026-11-22", "days": 3, "cancelled": false }, { "name": "Pawska 2026", "dates": "November 26-29, 2026", "venue": "Amber Hotel Gdańsk", "place": "Gdansk, Poland", "country": "Poland", "region": "europe", "start": "2026-11-26", "end": "2026-11-29", "days": 4, "cancelled": false }, { "name": "Patas 2026", "dates": "December 11-13, 2026", "venue": "Sorocaba Park Hotel by Atlantica", "place": "Sorocaba, SP, Brazil", "country": "Brazil", "region": "latin-america", "start": "2026-12-11", "end": "2026-12-13", "days": 3, "cancelled": false }, { "name": "Sachsen Furs Jahreswechsel 2026", "dates": "December 29, 2026 - January 1, 2027", "venue": "DJH Jugendherberge Dessau-Roßlau", "place": "Dessau-Roßlau, Germany", "country": "Germany", "region": "europe", "start": "2026-12-29", "end": "2027-01-01", "days": 4, "cancelled": false }, { "name": "Furvester 2026", "dates": "December 29, 2026 - January 2, 2027", "venue": "Stadthalle Karlsruhe", "place": "Karlsruhe, Germany", "country": "Germany", "region": "europe", "start": "2026-12-29", "end": "2027-01-02", "days": 5, "cancelled": false }, { "name": "Painted Desert Fur Con 2027", "dates": "January 1-3, 2027", "venue": "Sheraton Phoenix Downtown", "place": "Phoenix, AZ", "country": "United States", "region": "north-america", "start": "2027-01-01", "end": "2027-01-03", "days": 3, "cancelled": false }, { "name": "Japan Meeting of Furries 2027", "dates": "January 8-10, 2027", "venue": "Aichi Sky Expo", "place": "Tokoname, Japan", "country": "Japan", "region": "asia-pacific", "start": "2027-01-08", "end": "2027-01-10", "days": 3, "cancelled": false }, { "name": "Anthro New England 2027", "dates": "January 14-17, 2027", "venue": "The Westin Boston Seaport District", "place": "Boston, MA", "country": "United States", "region": "north-america", "start": "2027-01-14", "end": "2027-01-17", "days": 4, "cancelled": false }, { "name": "Further Confusion 2027", "dates": "January 14-18, 2027", "venue": "San Jose McEnery Convention Center", "place": "San Jose, CA", "country": "United States", "region": "north-america", "start": "2027-01-14", "end": "2027-01-18", "days": 5, "cancelled": false }, { "name": "SloFluffCon 2027", "dates": "January 21-24, 2027", "venue": "Grand Hotel Union Eurostars", "place": "Ljubljana, Slovenia", "country": "Slovenia", "region": "europe", "start": "2027-01-21", "end": "2027-01-24", "days": 4, "cancelled": false }, { "name": "FurSquared 2027", "dates": "February 4-7, 2027", "venue": "Hilton Milwaukee City Center", "place": "Milwaukee, WI", "country": "United States", "region": "north-america", "start": "2027-02-04", "end": "2027-02-07", "days": 4, "cancelled": false }, { "name": "Scotiacon 2027", "dates": "February 5-8, 2027", "venue": "Crowne Plaza Glasgow / Hilton Garden Inn Glasgow City Centre", "place": "Glasgow, UK", "country": "UK", "region": "europe", "start": "2027-02-05", "end": "2027-02-08", "days": 4, "cancelled": false }, { "name": "Capital Fur Con 2027", "dates": "February 18-21, 2027", "venue": "Gaylord National Resort & Convention Center", "place": "Oxon Hill, MD", "country": "United States", "region": "north-america", "start": "2027-02-18", "end": "2027-02-21", "days": 4, "cancelled": false }, { "name": "NordicFuzzCon 2027", "dates": "February 24-28, 2027", "venue": "Clarion Hotel & Congress Malmö Live", "place": "Malmö, Sweden", "country": "Sweden", "region": "europe", "start": "2027-02-24", "end": "2027-02-28", "days": 5, "cancelled": false }, { "name": "Furgeddaboutit 2027", "dates": "March 11-14, 2027", "venue": "Dolce by Wyndham Parsippany", "place": "Parsinppany, NJ", "country": "United States", "region": "north-america", "start": "2027-03-11", "end": "2027-03-14", "days": 4, "cancelled": false }, { "name": "Las Vegas Fur Con 2027", "dates": "March 25-28, 2027", "venue": "Alexis Park Resort", "place": "Las Vegas, NV", "country": "United States", "region": "north-america", "start": "2027-03-25", "end": "2027-03-28", "days": 4, "cancelled": false }, { "name": "MYFurCon 2027", "dates": "April 24-25, 2027", "venue": "Hotel Armada Petaling Jaya", "place": "Petaling Jaya, Selangor, Malaysia", "country": "Malaysia", "region": "asia-pacific", "start": "2027-04-24", "end": "2027-04-25", "days": 2, "cancelled": false }, { "name": "Paws & Prairies 2027", "dates": "April 30 - May 2, 2027", "venue": "Marriott Kansas City Overland Park", "place": "Overland Park, KS", "country": "United States", "region": "north-america", "start": "2027-04-30", "end": "2027-05-02", "days": 3, "cancelled": false }, { "name": "AnthroExpo 2027", "dates": "May 27-30, 2027", "venue": "Embassy Suites by Hilton Norman Hotel & Conference Center", "place": "Norman, OK", "country": "United States", "region": "north-america", "start": "2027-05-27", "end": "2027-05-30", "days": 4, "cancelled": false }, { "name": "ConFuzzled 2027", "dates": "May 28 - June 1, 2027", "venue": "Hilton Birmingham Metropole", "place": "Birmingham, UK", "country": "UK", "region": "europe", "start": "2027-05-28", "end": "2027-06-01", "days": 5, "cancelled": false }, { "name": "The Bigger One 2027", "dates": "June 12-13, 2027", "venue": "Delta Hotels Somerset", "place": "Somerset, NJ", "country": "United States", "region": "north-america", "start": "2027-06-12", "end": "2027-06-13", "days": 2, "cancelled": false }, { "name": "Anthrocon 2027", "dates": "July 1-4, 2027", "venue": "David L. Lawrence Convention Center", "place": "Pittsburgh, PA", "country": "United States", "region": "north-america", "start": "2027-07-01", "end": "2027-07-04", "days": 4, "cancelled": false } ];

const OFFICIAL_URLS: Record<string, string> = {
  'Futerkon 2026': 'https://futerkon.pl/',
  'Anthro Weekend Utah 2026': 'https://anthroweekendutah.org/',
  'Osaka Furry Fun Festa 2026': 'https://osaka-fff.jp/',
  'East 2026': 'https://sachsenfurs.de/en/east14/',
  'Furrydelphia 2026': 'https://furrydelphia.org/',
  'CanFURence 2026': 'https://canfurence.ca/',
  'Tails of Summer 2026': 'https://tailsofsummer.com/',
  'Bratislava FurFest 2026': 'https://blavff.sk/',
  'Dutch FurCon 2026': 'https://dutchfurcon.com/',
  'FUVE 2026': 'https://fuve.vn/',
  'Eurofurence 2026': 'https://www.eurofurence.org/',
  'Megaplex 2026': 'https://megaplexcon.org/',
  'Pawstral 2026': 'https://pawstral.cl/',
  'StratosFur 2026': 'https://stratosfur.org/',
  'Aberacon 2026': 'https://aberacon.wales/',
  'DenFur 2026': 'https://denfur.org/',
  'FursonaCon 2026': 'https://fursonacon.com/',
  'IndyFurCon 2026': 'https://indyfurcon.org/',
  'Calfurry 2026': 'https://www.calfurry.ca/',
  'Mephit Fur Meet 2026': 'https://www.mephitfurmeet.org/',
  'Tails and Tornadoes Fur Con 2026': 'https://tailsandtornadoes.org/',
  'Barkada FurFest 2026': 'https://barkadafurfest.ph/',
  'Furdance Budapest 2026': 'https://furdance.hu/EN/',
  'Furry Migration 2026': 'https://www.furrymigration.org/',
  'Anthro SoCal 2026': 'https://anthrosocal.org/',
  'Furever West 2026': 'https://www.wyofurcon.com/',
  'Wild North 2026': 'https://www.wildnorth.uk/',
  'FurGIV 2026': 'https://furgiv.org/',
  'Furrest City 2026': 'https://furrestcity.org/',
  'Furry Takeover 2026': 'https://furrytakeover.com/',
  'FurCalvaDance 2026': 'https://www.normandifurs.fr/',
  'H-Con 2026': 'https://h-con.org/',
  'Alamo City Furry Invasion 2026': 'https://www.furryinvasion.org/',
  'Carolina Furfare 2026': 'https://www.carolinafurfare.org/',
  'Michigan Anthro Weekend 2026': 'https://michigananthroweekend.com/',
  'Pawsome 2026': 'https://www.pawsome.org.uk/',
  'Western PA Furry Weekend 2026': 'https://wpafw.org/',
  'Party Along With Anthro Indonesia 2026': 'https://pawai.id/',
  'Anthro Party Argentina! 2026': 'https://anthropartyargentina.com/',
  'AquatiFur 2026': 'https://aquatifur.org/',
  'Heartland Howloween 2026': 'https://heartlandhowloween.com/',
  'Biggest Little Fur Con 2026': 'https://goblfc.org/',
  'Gateway FurMeet 2026': 'https://www.gatewayfurmeet.org/',
  'Furry Cruise 2026': 'https://furrycruise.com/',
  'Spooktacufur 2026': 'https://spooktacufur.com/',
  'Furnavia 2026': 'https://furnavia.org/',
  'Furry Blacklight 2026': 'https://fblacklight.org/',
  'Furry Retreat 2026': 'https://www.furryretreat.com/',
  'Confuror 2026': 'https://confuror.org/',
  'Furpocalypse 2026': 'https://furpocalypse.org/',
  'Infurnity 2026': 'https://www.infurnity.com/',
  'Wüellas FurFest 2026': 'https://www.wuff.cl/',
  'Wild Furloween West 2026': 'https://wildfurloweenwest.org/',
  'GoldenHorn 2026': 'https://goldenhorn.si/',
  'PAWCon 2026': 'https://pacanthro.org/',
  'Adelaide Anthros 2026': 'https://www.adelaideanthros.com/',
  'Flüüfff 2026': 'https://fluufff.org/',
  'Futrołajki 2026': 'https://futrolajki.pl/',
  'Furcation 2026': 'https://furcation.org.uk/',
  'Pawska 2026': 'https://volskarfurevents.eu/pawska-2026/',
  'Patas 2026': 'https://eventopatas.com/',
  'Sachsen Furs Jahreswechsel 2026': 'https://www.sachsen-furs.de/de/sfj/',
  'Furvester 2026': 'https://furvester.org/',
  'Painted Desert Fur Con 2027': 'https://painteddesertfc.com/',
  'Japan Meeting of Furries 2027': 'https://www.jmof.jp/en/',
  'Anthro New England 2027': 'https://www.anthronewengland.com/',
  'Further Confusion 2027': 'https://furtherconfusion.org/',
  'SloFluffCon 2027': 'https://slofluffcon.org/',
  'FurSquared 2027': 'https://fursquared.com/',
  'Scotiacon 2027': 'https://www.scotiacon.org.uk/',
  'Capital Fur Con 2027': 'https://capitalfurcon.org/',
  'NordicFuzzCon 2027': 'https://nordicfuzzcon.org/',
  'Furgeddaboutit 2027': 'https://www.furgeddaboutit.org/',
  'Las Vegas Fur Con 2027': 'https://lasvegasfurcon.org/',
  'MYFurCon 2027': 'https://myfur.org/',
  'Paws & Prairies 2027': 'https://www.pawsandprairies.com/',
  'AnthroExpo 2027': 'https://anthroexpo.net/',
  'ConFuzzled 2027': 'https://confuzzled.org.uk/',
  'The Bigger One 2027': 'https://the-bigger-one-ps-furmeets.carrd.co/',
  'Anthrocon 2027': 'https://www.anthrocon.org/',
};

const LAST_VERIFIED = '2026-08-02';
export const VERIFIED_DATA: VerifiedFurcon[] = DATA.map( ( event ) => ( {
  ...event,
  cancelled: event.name === 'Futerkon 2026' ? true : event.cancelled,
  officialUrl: OFFICIAL_URLS[ event.name ],
  lastVerified: LAST_VERIFIED,
} ) );

export const REGION_LABELS: Record<Region, string> = {
  'north-america': '北美',
  europe: '欧洲',
  'asia-pacific': '亚太',
  'latin-america': '拉美',
};

export const MONTHS = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];
const MONTHS_CN = [ '一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月' ];
export const REGION_FILTERS: Array<{ value: RegionFilter; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'uk', label: '英国' },
  { value: 'north-america', label: '北美' },
  { value: 'europe', label: '欧洲' },
  { value: 'asia-pacific', label: '亚太' },
  { value: 'latin-america', label: '拉美' },
];

export const LONDON_FURS_DATES = [
  { iso: '2026-08-08', day: '08', month: 'AUG' },
  { iso: '2026-08-29', day: '29', month: 'AUG' },
  { iso: '2026-09-19', day: '19', month: 'SEP' },
  { iso: '2026-10-10', day: '10', month: 'OCT' },
  { iso: '2026-10-31', day: '31', month: 'OCT' },
  { iso: '2026-11-21', day: '21', month: 'NOV' },
] as const;

function dateFromIso( value: string )
{
  return new Date( value + 'T00:00:00' );
}

function getToday()
{
  const today = new Date();
  today.setHours( 0, 0, 0, 0 );
  return today;
}

function pad( value: number )
{
  return String( value ).padStart( 2, '0' );
}

function formatIso( date: Date )
{
  return date.getFullYear() + '-' + pad( date.getMonth() + 1 ) + '-' + pad( date.getDate() );
}

function formatDate( value: string )
{
  const date = dateFromIso( value );
  return date.getFullYear() + '.' + pad( date.getMonth() + 1 ) + '.' + pad( date.getDate() );
}

function calendarDaysBetween( startIso: string, endIso: string )
{
  const start = Date.parse( startIso + 'T00:00:00Z' );
  const end = Date.parse( endIso + 'T00:00:00Z' );
  return Math.max( 0, Math.round( ( end - start ) / 86_400_000 ) );
}

export default function FurconIndex()
{
  const [ region, setRegion ] = useState<RegionFilter>( 'all' );
  const [ month, setMonth ] = useState<string | null>( null );
  const [ query, setQuery ] = useState( '' );

  const today = useMemo( () => getToday(), [] );
  const todayIso = formatIso( today );

  const events = useMemo( () => VERIFIED_DATA.map( ( event ) =>
  {
    const start = dateFromIso( event.start );
    const end = dateFromIso( event.end );
    const live = !event.cancelled && start <= today && today <= end;
    const past = end < today;

    return {
      ...event,
      key: event.start.slice( 0, 7 ),
      live,
      past,
      statusNote: event.cancelled
        ? '主办方标记为已取消'
        : live
          ? '正在举行，请在出发前查看官网最新安排'
          : past
            ? '活动已结束，页面保留作历史参考'
            : '日期已公布，请在预订行程前再次核对官网',
    };
  } ), [ today ] );

  const statistics = useMemo( () =>
  {
    const byRegion = events.reduce( ( totals, event ) =>
    {
      totals[ event.region ] = ( totals[ event.region ] ?? 0 ) + 1;
      return totals;
    }, {} as Record<Region, number> );

    const nextUp = events.find( ( event ) => !event.past && !event.live && !event.cancelled );
    const ukNext = events.find( ( event ) => event.country === 'UK' && !event.past && !event.live && !event.cancelled );
    const europeNext = events.find( ( event ) => event.region === 'europe' && !event.past && !event.live && !event.cancelled );
    const asiaPacificNext = events.find( ( event ) => event.region === 'asia-pacific' && !event.past && !event.live && !event.cancelled );
    const cancelled = events.filter( ( event ) => event.cancelled );
    const maxRegionCount = Math.max( ...Object.values( byRegion ) );

    return { asiaPacificNext, byRegion, cancelled, europeNext, maxRegionCount, nextUp, ukNext };
  }, [ events ] );

  const monthKeys = useMemo( () => Array.from( new Set( events.map( ( event ) => event.key ) ) ).sort(), [ events ] );

  const normalizedQuery = query.trim().toLowerCase();
  const filteredEvents = events.filter( ( event ) =>
    ( region === 'all' || ( region === 'uk' ? event.country === 'UK' : event.region === region ) ) &&
    ( !month || event.key === month ) &&
    ( !normalizedQuery || ( event.name + ' ' + event.place + ' ' + event.venue + ' ' + event.country ).toLowerCase().includes( normalizedQuery ) )
  );
  const groups = filteredEvents.reduce( ( result, event ) =>
  {
    const entries = result.get( event.key ) ?? [];
    entries.push( event );
    result.set( event.key, entries );
    return result;
  }, new Map<string, typeof filteredEvents>() );

  const countries = useMemo( () => new Set( events.map( ( event ) => event.country ) ).size, [ events ] );
  const { asiaPacificNext, byRegion, cancelled, europeNext, maxRegionCount, nextUp, ukNext } = statistics;
  const nextLondonFursDate = LONDON_FURS_DATES.find( ( date ) => date.iso >= todayIso );
  const daysUntilLondonFurs = nextLondonFursDate ? calendarDaysBetween( todayIso, nextLondonFursDate.iso ) : null;
  const selectedRegionLabel = REGION_FILTERS.find( ( filter ) => filter.value === region )?.label ?? '全部';

  return (
    <div className={styles.index}>
      <div className={styles.masterGrid} aria-hidden="true">
        {Array.from( { length: 12 }, ( _, index ) => <div key={index} className={styles.gridCol} /> )}
      </div>

      <div className={styles.shell}>
        <nav className={styles.nav} aria-label="Furcon index">
          <div>2026 — 2027</div>
          <div className={styles.logo}>兽展讯息<br />FURCON INDEX</div>
          <div>{todayIso}</div>
        </nav>

        <header className={styles.header}>
          <div className={styles.stackDetail} aria-hidden="true">
            {[ 120, 160, 200, 240 ].map( ( width, index ) => <div key={width} className={styles.stackLine} style={{ width, opacity: ( index + 1 ) / 4 }} /> )}
          </div>
          <span className={styles.metaLabel}>Convention Index v.2026 — 全球兽展一览</span>
          <h1>兽展讯息 <em>news</em><br /><span className={styles.year2026}>2026</span> — <span className={styles.year2027}>2027</span></h1>

        </header>

        <section className={styles.stats} aria-label="兽展统计">
          <div className={styles.square}>
            <span className={styles.num}>01</span>
            <div className={styles.figure}>{events.length}<span>场</span></div>
            <span className={styles.metaLabel}>收录场次 / total</span>
          </div>
          <div className={styles.square}>
            <span className={styles.num}>02</span>
            {daysUntilLondonFurs === null ? (
              <>
                <h2>—</h2>
                <span className={styles.metaLabel}>下一次 London Furs 日期待公布</span>
              </>
            ) : (
              <>
                <h2>{daysUntilLondonFurs} <em>days</em></h2>
                <span className={`${styles.metaLabel} ${styles.nextLondonDate}`}>距离下一次 <strong>London Furs</strong> · {formatDate( nextLondonFursDate!.iso )}</span>
              </>
            )}
          </div>
          <div className={`${styles.square} ${styles.focusSquare} ${styles.invert}`}>
            <span className={styles.num}>UK</span>
            <div>
              <span className={`${styles.metaLabel} ${styles.inlineLabel} ${styles.nextLabel}`}>英国下一场兽展 / next in UK</span>
              <h2>{ukNext ? <a href={ukNext.officialUrl} target="_blank" rel="noopener noreferrer">{ukNext.name}</a> : '—'}</h2>
            </div>
            <div className={styles.status}>
              <span className={styles.statusDot} />
              {ukNext ? formatDate( ukNext.start ) + ' · ' + ukNext.place : '暂无已公布场次'}
            </div>
          </div>
          <div className={`${styles.square} ${styles.focusSquare}`}>
            <span className={styles.num}>EU</span>
            <div>
              <span className={`${styles.metaLabel} ${styles.inlineLabel} ${styles.nextLabel}`}>欧洲下一场 / next in Europe</span>
              <h2>{europeNext ? <a href={europeNext.officialUrl} target="_blank" rel="noopener noreferrer">{europeNext.name}</a> : '—'}</h2>
            </div>
            <div className={styles.status}>
              <span className={styles.statusDot} />
              {europeNext ? formatDate( europeNext.start ) + ' · ' + europeNext.place : '暂无已公布场次'}
            </div>
          </div>
          <div className={`${styles.square} ${styles.doubleHeight}`}>
            <span className={styles.num}>04</span>
            <div className={styles.bars}>
              {Object.entries( byRegion ).sort( ( left, right ) => right[ 1 ] - left[ 1 ] ).map( ( [ regionName, count ] ) => (
                <div key={regionName} className={styles.barRow}>
                  <div><span>{REGION_LABELS[ regionName as Region ]}</span><span className={styles.num}>{count}</span></div>
                  <span className={styles.barTrack}><span className={styles.barFill} style={{ width: ( count / maxRegionCount ) * 100 + '%' }} /></span>
                </div>
              ) )}
            </div>
            <span className={styles.metaLabel}>区域分布 / by region</span>
          </div>
          <div className={`${styles.square} ${styles.focusSquare} ${styles.invert}`}>
            <span className={styles.num}>05</span>
            <div>
              <span className={`${styles.metaLabel} ${styles.inlineLabel}`}>每三周一次 · 星期六</span>
              <h2>伦敦兽聚 <a href="https://londonfurs.org.uk/" target="_blank" rel="noopener noreferrer"><em>London Furs网址链接</em></a></h2>
            </div>
            <div className={styles.status}>
              <span className={styles.statusDot} />
              地点：Tank &amp; Paddle (Minster Court)
            </div>
          </div>
          <div className={`${styles.square} ${styles.focusSquare}`}>
            <span className={styles.num}>APAC</span>
            <div>
              <span className={`${styles.metaLabel} ${styles.inlineLabel} ${styles.nextLabel}`}>亚太下一场 / next in Asia-Pacific</span>
              <h2>{asiaPacificNext ? <a href={asiaPacificNext.officialUrl} target="_blank" rel="noopener noreferrer">{asiaPacificNext.name}</a> : '—'}</h2>
            </div>
            <div className={styles.status}>
              <span className={styles.statusDot} />
              {asiaPacificNext ? formatDate( asiaPacificNext.start ) + ' · ' + asiaPacificNext.place : '暂无已公布场次'}
            </div>
          </div>
          <div className={`${styles.square} ${styles.friendSquare}`}>
            <span className={styles.num}>07 · 友情链接</span>
            <a
              className={styles.friendLink}
              href="https://www.furrycons.cn/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="前往 FurryCons 国内兽展日程表（新窗口打开）"
            >
              <span className={styles.friendBubble}>
                <strong>突然想看下国内兽展的日程表吗，来这个友情网站</strong>
                <small>FURRYCONS.CN ↗</small>
              </span>
              <span className={styles.friendAvatar}>
                <Image
                  src={millerIcon}
                  alt="米勒头像"
                  className="h-full w-full object-cover [image-rendering:pixelated]"
                />
              </span>
            </a>
          </div>
          <div className={`${styles.square} ${styles.doubleWidth} ${styles.londonDates}`}>
            <span className={styles.num}>08</span>
            <div className={styles.londonDatesHead}>
              <h2>London Furs Dates <em></em></h2>
              <span className={styles.metaLabel}>2026 · 每三周星期六</span>
            </div>
            <div className={styles.dateGrid} aria-label="London Furs 2026 日期">
              {LONDON_FURS_DATES.map( ( date ) => (
                <time key={date.iso} dateTime={date.iso}>
                  <strong>{date.day}</strong>
                  <span>{date.month}</span>
                </time>
              ) )}
            </div>
          </div>
          <div className={styles.square}>
            <span className={styles.num}>09</span>
            <div className={styles.figure}>{cancelled.length}<span>场</span></div>
            <span className={styles.metaLabel}>已取消 · {cancelled.map( ( event ) => event.name ).join( ', ' ) || '无'}</span>
          </div>
        </section>

        <section className={styles.band} aria-label="按月份筛选">
          <div className={styles.bandHead}>
            <span className={styles.metaLabel}>按月份密度 / one line per convention</span>
            <span className={styles.metaLabel}>{month ? '再次点击取消筛选' : '点击月份筛选'}</span>
          </div>
          <div className={styles.bandMonths}>
            {monthKeys.map( ( key ) =>
            {
              const items = events.filter( ( event ) => event.key === key );
              const monthIndex = Number( key.slice( 5, 7 ) ) - 1;

              return (
                <button
                  key={key}
                  type="button"
                  className={`${styles.month}${month === key ? ` ${styles.isOn}` : ''}`}
                  aria-pressed={month === key}
                  onClick={() => setMonth( month === key ? null : key )}
                >
                  <span className={styles.ticks}>{items.map( ( event ) => <span key={event.name} className={`${styles.tick}${event.cancelled ? ` ${styles.isCancelled}` : ''}`} /> )}</span>
                  <span>
                    <span className={styles.monthLabel}>{MONTHS[ monthIndex ]} <small>&apos;{key.slice( 2, 4 )}</small></span>
                    <span className={styles.monthCount}>{pad( items.length )}</span>
                  </span>
                </button>
              );
            } )}
          </div>
        </section>

        <section className={styles.controls} aria-label="兽展筛选">
          {REGION_FILTERS.map( ( filter ) =>
          {
            const count = filter.value === 'all'
              ? events.length
              : filter.value === 'uk'
                ? events.filter( ( event ) => event.country === 'UK' ).length
                : byRegion[ filter.value ];

            return (
              <button
                key={filter.value}
                type="button"
                data-filter={filter.value}
                className={`${styles.chip}${region === filter.value ? ` ${styles.isOn}` : ''}`}
                aria-pressed={region === filter.value}
                aria-controls="furcon-results"
                onClick={() => setRegion( filter.value )}
              >
                {filter.label} <span>{pad( count )}</span>
              </button>
            );
          } )}
          <label className={styles.searchLabel}>
            <span className="sr-only">搜索兽展</span>
            <input value={query} onChange={( event ) => setQuery( event.target.value )} type="search" placeholder="搜索名称、城市、场地…" />
          </label>
          <span className={styles.tally} aria-hidden="true">{pad( filteredEvents.length )} / {events.length}</span>
          <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
            当前显示 {filteredEvents.length} 场兽展；地区：{selectedRegionLabel}{month ? '；月份：' + month : ''}{query.trim() ? '；搜索：' + query.trim() : ''}。
          </p>
        </section>

        <section id="furcon-results" className={styles.list} aria-label="兽展列表">
          {filteredEvents.length === 0 ? (
            <p className={styles.empty}>没有符合条件的兽展。换一个月份或清空搜索试试。</p>
          ) : (
            Array.from( groups.entries() ).map( ( [ key, entries ] ) =>
            {
              const monthIndex = Number( key.slice( 5, 7 ) ) - 1;

              return (
                <section key={key}>
                  <div className={styles.monthHead}>
                    <span>{MONTHS_CN[ monthIndex ]} <em>{MONTHS[ monthIndex ]}</em> {key.slice( 0, 4 )}</span>
                    <span className={styles.num}>{pad( entries.length )}</span>
                  </div>
                  {entries.map( ( event ) =>
                  {
                    const eventNumber = filteredEvents.indexOf( event ) + 1;
                    const isNext = event.name === nextUp?.name;

                    return (
                      <article key={event.name} className={[ styles.listRow, event.live && styles.isLive, event.past && styles.isPast, event.cancelled && styles.isCancelled ].filter( Boolean ).join( ' ' )}>
                        <span className={styles.num}>{pad( eventNumber )}</span>
                        <div>
                          <h3>
                            <a href={event.officialUrl} target="_blank" rel="noopener noreferrer">
                              {event.name}<span className="sr-only">（打开主办方官网）</span>
                            </a>
                            {event.cancelled && <small>已取消</small>}{event.live && <small>进行中</small>}{isNext && <small>→ 全球下一场</small>}
                          </h3>
                          <p>{event.venue}</p>
                          <p className={styles.verification}><span>{event.statusNote}</span><span>核对于 {event.lastVerified}</span></p>
                        </div>
                        <p className={styles.when}>{event.dates}<br /><span>{event.days} {event.days > 1 ? 'days' : 'day'}</span></p>
                        <p className={styles.where}>{event.place}<span>{REGION_LABELS[ event.region ]}</span></p>
                      </article>
                    );
                  } )}
                </section>
              );
            } )
          )}
        </section>

        <footer className={styles.footer}>
          <div>
            <p>兽展讯息汇合 — 共 {events.length} 场 / {countries} 个国家与地区</p>
            <p>日期以主办方公布为准，出行前请再次核对</p>
          </div>
          <div>
            <a href="#">关于</a><a href="#">投稿</a><a href="#">订阅</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
