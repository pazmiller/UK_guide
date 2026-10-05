import Hero from '@/components/Hero';
import CampusLetters from '@/components/CampusLetters';
import CreditsSection from '@/components/CreditsSection';
import DispatchStand from '@/components/DispatchStand';
import EatsReceipts from '@/components/EatsReceipts';
import HomeScene from '@/components/HomeScene';
import ExploreCarriage from '@/components/ExploreCarriage';
import OnboardingPassport from '@/components/OnboardingPassport';
import StationStrip from '@/components/StationStrip';
import TubeRail from '@/components/TubeRail';
import WelcomeBoard from '@/components/WelcomeBoard';
import { londonAttractions } from '@/data/london/attractions';
import { londonCafes } from '@/data/london/cafes';
import { londonRestaurants } from '@/data/london/restaurants';
import { countCityRecommendations } from '@/data/cityRegistry';
import { getEuropaDestinations, getUkCities } from '@/lib/server/cities';

const RIBBON_PLACES = [ 'London', 'Edinburgh', 'York', 'Glasgow', 'Nottingham', 'Oxford', 'Cambridge', 'Manchester', 'Bath', 'Reykjavík', 'Kraków' ];

export default function Home()
{
  const featuredRestaurants = londonRestaurants.slice( 0, 3 );
  // Restaurants only (cafés excluded); London is kept apart from the other UK cities in the data
  const countRestaurants = ( cities: { restaurants: unknown[] }[] ) => cities.reduce( ( total, city ) => total + city.restaurants.length, 0 );
  const restaurantCounts = {
    london: londonRestaurants.length,
    uk: londonRestaurants.length + countRestaurants( getUkCities() ),
    europa: countRestaurants( getEuropaDestinations() ),
  };
  // Every built "station" of the community database: London plus each city that has recommendations
  const builtStations = [
    { name: 'London', count: londonRestaurants.length + londonCafes.length + londonAttractions.length },
    ...[ ...getUkCities(), ...getEuropaDestinations() ].map( city => ( { name: city.nameEn, count: countCityRecommendations( city ) } ) ),
  ].filter( station => station.count > 0 );

  return (
    <>
      <Hero />
      <TubeRail />



      {/* About Section */}
      <section id="welcome" className="scroll-mt-16 overflow-x-clip pt-12 pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StationStrip index={0} className="mb-12" />
          <WelcomeBoard />

          <StationStrip index={1} anchor className="mt-16 mb-8" />
          <OnboardingPassport />
        </div>
      </section>

      {/* City ribbon — a moving departures board between sections */}
      <div className="marquee relative overflow-hidden border-y-4 border-[#E63946] bg-[#1D3557] py-4" aria-hidden="true">
        <div className="marquee-track flex w-max">
          {[ 0, 1 ].map( copy => (
            <div key={copy} className="flex shrink-0 items-center">
              {RIBBON_PLACES.map( place => (
                <span key={place} className="flex items-center whitespace-nowrap px-6 text-lg font-black uppercase tracking-[0.2em] text-white/90">
                  {place}
                  <span className="ml-12 h-2 w-2 rotate-45 bg-[#F4A261]" />
                </span>
              ) )}
            </div>
          ) )}
        </div>
      </div>

      {/* Explore → Campus: photo backdrops (Santorini, London, Royal Holloway) over a shared navy.
          overflow-clip, not hidden: a hidden box becomes a scroll container and stalls the scroll-driven reveals inside.
          isolate + no z-index on the London–Campus sections: their backdrops share this stacking context,
          so the overlapping photos crossfade behind every section's content. */}
      <div className="relative isolate overflow-clip bg-[#0B1A2E]">

        {/* Explore */}
        <section id="explore" className="relative z-10 scroll-mt-16 py-20">
          <HomeScene kind="explore" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <StationStrip index={2} tone="dark" className="mb-12" />
            <ExploreCarriage stations={builtStations} />
          </div>
        </section>

        {/* Eats and Dispatch share one London backdrop */}
        <div className="relative">
          <HomeScene kind="london" bleed="bottom" />
          <section id="restaurants" className="relative scroll-mt-16 py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <StationStrip index={3} tone="dark" className="mb-12" />
              <EatsReceipts restaurants={featuredRestaurants} counts={restaurantCounts} />
            </div>
          </section>

          <section id="news" className="relative scroll-mt-16 pt-16 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <StationStrip index={4} tone="dark" className="mb-10" />
              <DispatchStand />
            </div>
          </section>
        </div>
        <section id="universities" className="relative scroll-mt-16 pt-16 pb-20">
          <HomeScene kind="campus" bleed="top" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <StationStrip index={5} tone="dark" className="mb-10" />
            <CampusLetters />
          </div>
        </section>
        <div className="relative z-10 bg-gradient-to-b from-transparent to-[#1D3557] pt-6 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <StationStrip tone="dark" />
          </div>
        </div>
      </div>
      <CreditsSection />
    </>
  );
}
