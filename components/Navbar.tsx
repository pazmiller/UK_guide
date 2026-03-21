'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X, MapPin, Building, Utensils, Coffee, ChevronDown, ShieldAlert } from 'lucide-react';

export default function Navbar()
{
  const [ isOpen, setIsOpen ] = useState( false );
  const [ londonOpen, setLondonOpen ] = useState( false );
  const [ citiesOpen, setCitiesOpen ] = useState( false );
  const [ europaOpen, setEuropaOpen ] = useState( false );
  const [ scrolled, setScrolled ] = useState( false );
  const pathname = usePathname();

  useEffect( () =>
  {
    const onScroll = () => setScrolled( window.scrollY > 20 );
    window.addEventListener( 'scroll', onScroll, { passive: true } );
    onScroll();
    return () => window.removeEventListener( 'scroll', onScroll );
  }, [] );

  const isOnLondon = pathname.startsWith( '/london' );
  const isOnCities = pathname.startsWith( '/othercities' );
  const isOnEuropa = pathname.startsWith( '/europa' );

  const londonSubLinks = [
    { href: '/london/attractions', label: 'Attractions', icon: Building },
    { href: '/london/restaurants', label: 'Restaurants', icon: Utensils },
    { href: '/london/cafes', label: 'Cafes', icon: Coffee },
  ];

  const citiesSubLinks = [
    { href: '/othercities/york', label: 'York' },
    { href: '/othercities/glasgow', label: 'Glasgow' },
    { href: '/othercities/edinburgh', label: 'Edinburgh' },
    { href: '/othercities/southampton', label: 'Southampton' },
    { href: '/othercities/swansea', label: 'Swansea' },
  ];

  const europaSubLinks = [
    { href: '/europa/iceland', label: 'Iceland' },
    { href: '/europa/poland', label: 'Poland' },
    { href: '/europa/stockholm', label: 'Stockholm' },
    { href: '/europa/copenhagen', label: 'København' },
    { href: '/europa/paris', label: 'Paris' },
    { href: '/europa/koln', label: 'Köln' },
  ];

  /* shared pill classes */
  const pill = 'rounded-full px-3 py-1 transition-all duration-200';
  const activePill = `${pill} bg-white/10 text-[#F4A261]`;
  const hoverPill = `${pill} text-white/90 hover:bg-white/8 hover:text-[#F4A261]`;
  const activeRedPill = `${pill} bg-[#E63946] text-white`;
  const hoverRedPill = `${pill} text-white/90 hover:bg-[#E63946]/20 hover:text-[#E63946]`;

  /* dropdown animation classes */
  const dropdownBase = 'absolute top-full left-1/2 -translate-x-1/2 pt-2 transition-all duration-200 ease-out origin-top';
  const dropdownOpen = 'opacity-100 scale-100 translate-y-0 pointer-events-auto';
  const dropdownClosed = 'opacity-0 scale-95 -translate-y-1 pointer-events-none';

  return (
    <>
      <style>{`
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-10px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#1D3557]/97 backdrop-blur-md shadow-xl border-b border-white/5'
          : 'bg-[#1D3557]/80 backdrop-blur-sm'
      }`}>
        {/* Main Nav Row */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-[68px]">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 bg-[#E63946] rounded-lg flex items-center justify-center
                transition-all duration-200
                group-hover:scale-110 group-hover:ring-2 group-hover:ring-[#E63946]/50 group-hover:ring-offset-2 group-hover:ring-offset-[#1D3557]">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <span className="text-white font-black text-xl tracking-tighter">
                Discover<span className="text-[#F4A261]">GB</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">

              {/* Home */}
              <Link href="/" className={`font-medium text-sm ${pathname === '/' ? activePill : hoverPill}`}>
                Home
              </Link>

              {/* London Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setLondonOpen( true )}
                onMouseLeave={() => setLondonOpen( false )}
              >
                <Link
                  href="/london"
                  className={`flex items-center gap-1 font-medium text-sm ${isOnLondon ? activePill : hoverPill}`}
                >
                  London
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${londonOpen ? 'rotate-180' : ''}`} />
                </Link>
                <div className={`${dropdownBase} ${londonOpen ? dropdownOpen : dropdownClosed}`}>
                  <div className="bg-white rounded-xl shadow-2xl overflow-hidden min-w-[190px] ring-1 ring-black/5">
                    {londonSubLinks.map( ( sub ) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className={`flex items-center gap-3 px-5 py-3 text-sm font-medium transition-all duration-150
                          border-l-2 hover:pl-[22px]
                          ${pathname === sub.href
                            ? 'text-[#E63946] bg-[#FFF1F2] border-[#E63946]'
                            : 'text-[#1D3557] hover:bg-[#F1FAEE] border-transparent hover:border-[#E63946]'}`}
                      >
                        <sub.icon className="w-4 h-4 shrink-0" />
                        {sub.label}
                      </Link>
                    ) )}
                  </div>
                </div>
              </div>

              {/* Other Cities Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setCitiesOpen( true )}
                onMouseLeave={() => setCitiesOpen( false )}
              >
                <Link
                  href="/othercities"
                  className={`flex items-center gap-1 font-medium text-sm ${isOnCities ? activePill : hoverPill}`}
                >
                  Other Cities
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${citiesOpen ? 'rotate-180' : ''}`} />
                </Link>
                <div className={`${dropdownBase} ${citiesOpen ? dropdownOpen : dropdownClosed}`}>
                  <div className="bg-white rounded-xl shadow-2xl overflow-hidden min-w-[190px] ring-1 ring-black/5">
                    {citiesSubLinks.map( ( sub ) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className={`block px-5 py-3 text-sm font-medium transition-all duration-150
                          border-l-2 hover:pl-[22px]
                          ${pathname === sub.href
                            ? 'text-[#E63946] bg-[#FFF1F2] border-[#E63946]'
                            : 'text-[#1D3557] hover:bg-[#F1FAEE] border-transparent hover:border-[#E63946]'}`}
                      >
                        {sub.label}
                      </Link>
                    ) )}
                  </div>
                </div>
              </div>

              {/* Europa Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setEuropaOpen( true )}
                onMouseLeave={() => setEuropaOpen( false )}
              >
                <Link
                  href="/europa"
                  className={`flex items-center gap-1 font-medium text-sm ${isOnEuropa ? activePill : hoverPill}`}
                >
                  Europa
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${europaOpen ? 'rotate-180' : ''}`} />
                </Link>
                <div className={`${dropdownBase} ${europaOpen ? dropdownOpen : dropdownClosed}`}>
                  <div className="bg-white rounded-xl shadow-2xl overflow-hidden min-w-[190px] ring-1 ring-black/5">
                    {europaSubLinks.map( ( sub ) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className={`block px-5 py-3 text-sm font-medium transition-all duration-150
                          border-l-2 hover:pl-[22px]
                          ${pathname === sub.href
                            ? 'text-[#E63946] bg-[#FFF1F2] border-[#E63946]'
                            : 'text-[#1D3557] hover:bg-[#F1FAEE] border-transparent hover:border-[#E63946]'}`}
                      >
                        {sub.label}
                      </Link>
                    ) )}
                  </div>
                </div>
              </div>

              {/* No Good */}
              <Link
                href="/avoid"
                className={`flex items-center gap-1.5 font-medium text-sm ${pathname === '/avoid' ? activeRedPill : hoverRedPill}`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                No Good
              </Link>

              {/* Contact */}
              <Link href="/contact" className={`font-medium text-sm ${pathname === '/contact' ? activePill : hoverPill}`}>
                Contact
              </Link>

              {/* About */}
              <Link href="/about" className={`font-medium text-sm ${pathname === '/about' ? activePill : hoverPill}`}>
                About
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen( !isOpen )}
              className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* London Sub-Nav Bar */}
        {isOnLondon && (
          <div className="hidden md:block border-t border-white/10 bg-[#152845]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-1 h-10">
                {londonSubLinks.map( ( sub ) => (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    className={`flex items-center gap-2 px-4 h-full text-sm font-medium transition-colors border-b-2 ${
                      pathname.startsWith( sub.href )
                        ? 'text-[#F4A261] border-[#F4A261]'
                        : 'text-white/70 border-transparent hover:text-white hover:border-white/40'
                    }`}
                  >
                    <sub.icon className="w-3.5 h-3.5" />
                    {sub.label}
                  </Link>
                ) )}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden bg-[#1D3557] border-t border-white/10">
            <div className="px-4 py-4 space-y-0.5">
              {( [
                { href: '/', label: 'Home', exact: true },
              ] as const ).map( ( item, i ) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen( false )}
                  style={{ animation: 'slideInLeft 0.2s ease forwards', animationDelay: `${i * 40}ms`, opacity: 0 }}
                  className={`block font-medium py-2 px-3 rounded-lg transition-colors ${pathname === item.href ? 'text-[#F4A261] bg-white/5' : 'text-white/90 hover:text-[#F4A261] hover:bg-white/5'}`}
                >
                  {item.label}
                </Link>
              ) )}

              {/* London */}
              <div style={{ animation: 'slideInLeft 0.2s ease forwards', animationDelay: '40ms', opacity: 0 }}>
                <Link href="/london" onClick={() => setIsOpen( false )} className={`block font-medium py-2 px-3 rounded-lg transition-colors ${isOnLondon ? 'text-[#F4A261] bg-white/5' : 'text-white/90 hover:text-[#F4A261] hover:bg-white/5'}`}>
                  London
                </Link>
                <div className="pl-4 space-y-0.5 border-l border-white/20 ml-3 mt-0.5 mb-1">
                  {londonSubLinks.map( ( sub, i ) => (
                    <Link key={sub.href} href={sub.href} onClick={() => setIsOpen( false )}
                      style={{ animation: 'slideInLeft 0.2s ease forwards', animationDelay: `${( i + 2 ) * 40}ms`, opacity: 0 }}
                      className={`flex items-center gap-2 py-1.5 px-2 rounded-md text-sm transition-colors ${pathname.startsWith( sub.href ) ? 'text-[#F4A261]' : 'text-white/70 hover:text-white'}`}
                    >
                      <sub.icon className="w-3.5 h-3.5" />
                      {sub.label}
                    </Link>
                  ) )}
                </div>
              </div>

              {/* Other Cities */}
              <div style={{ animation: 'slideInLeft 0.2s ease forwards', animationDelay: '200ms', opacity: 0 }}>
                <Link href="/othercities" onClick={() => setIsOpen( false )} className={`block font-medium py-2 px-3 rounded-lg transition-colors ${isOnCities ? 'text-[#F4A261] bg-white/5' : 'text-white/90 hover:text-[#F4A261] hover:bg-white/5'}`}>
                  Other Cities
                </Link>
                <div className="pl-4 space-y-0.5 border-l border-white/20 ml-3 mt-0.5 mb-1">
                  {citiesSubLinks.map( ( sub, i ) => (
                    <Link key={sub.href} href={sub.href} onClick={() => setIsOpen( false )}
                      style={{ animation: 'slideInLeft 0.2s ease forwards', animationDelay: `${( i + 6 ) * 40}ms`, opacity: 0 }}
                      className={`block py-1.5 px-2 rounded-md text-sm transition-colors ${pathname === sub.href ? 'text-[#F4A261]' : 'text-white/70 hover:text-white'}`}
                    >
                      {sub.label}
                    </Link>
                  ) )}
                </div>
              </div>

              {/* Europa */}
              <div style={{ animation: 'slideInLeft 0.2s ease forwards', animationDelay: '400ms', opacity: 0 }}>
                <Link href="/europa" onClick={() => setIsOpen( false )} className={`block font-medium py-2 px-3 rounded-lg transition-colors ${isOnEuropa ? 'text-[#F4A261] bg-white/5' : 'text-white/90 hover:text-[#F4A261] hover:bg-white/5'}`}>
                  Europa
                </Link>
                <div className="pl-4 space-y-0.5 border-l border-white/20 ml-3 mt-0.5 mb-1">
                  {europaSubLinks.map( ( sub, i ) => (
                    <Link key={sub.href} href={sub.href} onClick={() => setIsOpen( false )}
                      style={{ animation: 'slideInLeft 0.2s ease forwards', animationDelay: `${( i + 11 ) * 40}ms`, opacity: 0 }}
                      className={`block py-1.5 px-2 rounded-md text-sm transition-colors ${pathname === sub.href ? 'text-[#F4A261]' : 'text-white/70 hover:text-white'}`}
                    >
                      {sub.label}
                    </Link>
                  ) )}
                </div>
              </div>

              {/* No Good */}
              <div style={{ animation: 'slideInLeft 0.2s ease forwards', animationDelay: '640ms', opacity: 0 }}>
                <Link href="/avoid" onClick={() => setIsOpen( false )} className={`flex items-center gap-1.5 font-medium py-2 px-3 rounded-lg transition-colors ${pathname === '/avoid' ? 'text-[#E63946] bg-[#E63946]/10' : 'text-white/90 hover:text-[#E63946] hover:bg-[#E63946]/10'}`}>
                  <ShieldAlert className="w-4 h-4" />
                  No Good
                </Link>
              </div>

              {/* Contact & About */}
              {[ { href: '/contact', label: 'Contact', delay: 680 }, { href: '/about', label: 'About', delay: 720 } ].map( ( item ) => (
                <div key={item.href} style={{ animation: 'slideInLeft 0.2s ease forwards', animationDelay: `${item.delay}ms`, opacity: 0 }}>
                  <Link href={item.href} onClick={() => setIsOpen( false )} className={`block font-medium py-2 px-3 rounded-lg transition-colors ${pathname === item.href ? 'text-[#F4A261] bg-white/5' : 'text-white/90 hover:text-[#F4A261] hover:bg-white/5'}`}>
                    {item.label}
                  </Link>
                </div>
              ) )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
