'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X, MapPin, Building, Utensils, Coffee, ChevronDown, ShieldAlert } from 'lucide-react';

export default function Navbar()
{
  const [ isOpen, setIsOpen ] = useState( false );
  const [ londonOpen, setLondonOpen ] = useState( false );
  const [ citiesOpen, setCitiesOpen ] = useState( false );
  const [ europaOpen, setEuropaOpen ] = useState( false );
  const pathname = usePathname();

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
    { href: '/othercities/southampton', label: 'Southampton' },
    { href: '/othercities/swansea', label: 'Swansea' },
  ];

  const europaSubLinks = [
    { href: '/europa/iceland', label: 'Iceland' },
    { href: '/europa/poland', label: 'Poland' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1D3557]/95 backdrop-blur-sm shadow-lg">
      {/* Main Nav Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-[#E63946] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">
              Discover<span className="text-[#F4A261]">GB</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {/* Home */}
            <Link
              href="/"
              className={`font-medium transition-colors relative group ${pathname === '/' ? 'text-[#F4A261]' : 'text-white/90 hover:text-[#F4A261]'
                }`}
            >
              Home
              <span className={`absolute bottom-0 left-0 h-0.5 bg-[#F4A261] transition-all ${pathname === '/' ? 'w-full' : 'w-0 group-hover:w-full'}`} />
            </Link>

            {/* London Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setLondonOpen( true )}
              onMouseLeave={() => setLondonOpen( false )}
            >
              <Link
                href="/london"
                className={`flex items-center gap-1 font-medium transition-colors relative group ${isOnLondon ? 'text-[#F4A261]' : 'text-white/90 hover:text-[#F4A261]'
                  }`}
              >
                London
                <ChevronDown className={`w-4 h-4 transition-transform ${londonOpen ? 'rotate-180' : ''}`} />
                <span className={`absolute bottom-0 left-0 h-0.5 bg-[#F4A261] transition-all ${isOnLondon ? 'w-full' : 'w-0 group-hover:w-full'}`} />
              </Link>
              {londonOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2">
                  <div className="bg-white rounded-xl shadow-xl overflow-hidden min-w-[180px]">
                    {londonSubLinks.map( ( sub ) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className={`flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors hover:bg-[#F1FAEE] ${pathname === sub.href ? 'text-[#E63946] bg-[#F1FAEE]' : 'text-[#1D3557]'
                          }`}
                      >
                        <sub.icon className="w-4 h-4" />
                        {sub.label}
                      </Link>
                    ) )}
                  </div>
                </div>
              )}
            </div>

            {/* Other Cities Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setCitiesOpen( true )}
              onMouseLeave={() => setCitiesOpen( false )}
            >
              <Link
                href="/othercities"
                className={`flex items-center gap-1 font-medium transition-colors relative group ${isOnCities ? 'text-[#F4A261]' : 'text-white/90 hover:text-[#F4A261]'
                  }`}
              >
                Other Cities
                <ChevronDown className={`w-4 h-4 transition-transform ${citiesOpen ? 'rotate-180' : ''}`} />
                <span className={`absolute bottom-0 left-0 h-0.5 bg-[#F4A261] transition-all ${isOnCities ? 'w-full' : 'w-0 group-hover:w-full'}`} />
              </Link>
              {citiesOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2">
                  <div className="bg-white rounded-xl shadow-xl overflow-hidden min-w-[180px]">
                    {citiesSubLinks.map( ( sub ) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className={`block px-5 py-3 text-sm font-medium transition-colors hover:bg-[#F1FAEE] ${pathname === sub.href ? 'text-[#E63946] bg-[#F1FAEE]' : 'text-[#1D3557]'
                          }`}
                      >
                        {sub.label}
                      </Link>
                    ) )}
                  </div>
                </div>
              )}
            </div>

            {/* Europa Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setEuropaOpen( true )}
              onMouseLeave={() => setEuropaOpen( false )}
            >
              <Link
                href="/europa"
                className={`flex items-center gap-1 font-medium transition-colors relative group ${isOnEuropa ? 'text-[#F4A261]' : 'text-white/90 hover:text-[#F4A261]'
                  }`}
              >
                Europa
                <ChevronDown className={`w-4 h-4 transition-transform ${europaOpen ? 'rotate-180' : ''}`} />
                <span className={`absolute bottom-0 left-0 h-0.5 bg-[#F4A261] transition-all ${isOnEuropa ? 'w-full' : 'w-0 group-hover:w-full'}`} />
              </Link>
              {europaOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2">
                  <div className="bg-white rounded-xl shadow-xl overflow-hidden min-w-[180px]">
                    {europaSubLinks.map( ( sub ) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className={`block px-5 py-3 text-sm font-medium transition-colors hover:bg-[#F1FAEE] ${pathname === sub.href ? 'text-[#E63946] bg-[#F1FAEE]' : 'text-[#1D3557]'
                          }`}
                      >
                        {sub.label}
                      </Link>
                    ) )}
                  </div>
                </div>
              )}
            </div>

            {/* Avoid Zone */}
            <Link
              href="/avoid"
              className={`flex items-center gap-1 font-medium transition-colors relative group ${pathname === '/avoid' ? 'text-[#E63946]' : 'text-white/90 hover:text-[#E63946]'
                }`}
            >
              <ShieldAlert className="w-4 h-4" />
              Avoid
              <span className={`absolute bottom-0 left-0 h-0.5 bg-[#E63946] transition-all ${pathname === '/avoid' ? 'w-full' : 'w-0 group-hover:w-full'}`} />
            </Link>

            {/* Contact */}
            <Link
              href="/contact"
              className={`font-medium transition-colors relative group ${pathname === '/contact' ? 'text-[#F4A261]' : 'text-white/90 hover:text-[#F4A261]'
                }`}
            >
              Contact
              <span className={`absolute bottom-0 left-0 h-0.5 bg-[#F4A261] transition-all ${pathname === '/contact' ? 'w-full' : 'w-0 group-hover:w-full'}`} />
            </Link>

            {/* About */}
            <Link
              href="/about"
              className={`font-medium transition-colors relative group ${pathname === '/about' ? 'text-[#F4A261]' : 'text-white/90 hover:text-[#F4A261]'
                }`}
            >
              About
              <span className={`absolute bottom-0 left-0 h-0.5 bg-[#F4A261] transition-all ${pathname === '/about' ? 'w-full' : 'w-0 group-hover:w-full'}`} />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen( !isOpen )}
            className="md:hidden text-white p-2"
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
                  className={`flex items-center gap-2 px-4 h-full text-sm font-medium transition-colors border-b-2 ${pathname.startsWith( sub.href )
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
          <div className="px-4 py-4 space-y-1">
            {/* Home */}
            <Link href="/" onClick={() => setIsOpen( false )} className={`block font-medium py-2 transition-colors ${pathname === '/' ? 'text-[#F4A261]' : 'text-white/90 hover:text-[#F4A261]'}`}>
              Home
            </Link>

            {/* London */}
            <Link href="/london" onClick={() => setIsOpen( false )} className={`block font-medium py-2 transition-colors ${isOnLondon ? 'text-[#F4A261]' : 'text-white/90 hover:text-[#F4A261]'}`}>
              London
            </Link>
            <div className="pl-4 space-y-1 border-l border-white/20 ml-2 mb-2">
              {londonSubLinks.map( ( sub ) => (
                <Link key={sub.href} href={sub.href} onClick={() => setIsOpen( false )} className={`flex items-center gap-2 py-1.5 text-sm transition-colors ${pathname.startsWith( sub.href ) ? 'text-[#F4A261]' : 'text-white/70 hover:text-white'}`}>
                  <sub.icon className="w-3.5 h-3.5" />
                  {sub.label}
                </Link>
              ) )}
            </div>

            {/* Other Cities */}
            <Link href="/othercities" onClick={() => setIsOpen( false )} className={`block font-medium py-2 transition-colors ${isOnCities ? 'text-[#F4A261]' : 'text-white/90 hover:text-[#F4A261]'}`}>
              Other Cities
            </Link>
            <div className="pl-4 space-y-1 border-l border-white/20 ml-2 mb-2">
              {citiesSubLinks.map( ( sub ) => (
                <Link key={sub.href} href={sub.href} onClick={() => setIsOpen( false )} className={`block py-1.5 text-sm transition-colors ${pathname === sub.href ? 'text-[#F4A261]' : 'text-white/70 hover:text-white'}`}>
                  {sub.label}
                </Link>
              ) )}
            </div>

            {/* Europa */}
            <Link href="/europa" onClick={() => setIsOpen( false )} className={`block font-medium py-2 transition-colors ${isOnEuropa ? 'text-[#F4A261]' : 'text-white/90 hover:text-[#F4A261]'}`}>
              Europa
            </Link>
            <div className="pl-4 space-y-1 border-l border-white/20 ml-2 mb-2">
              {europaSubLinks.map( ( sub ) => (
                <Link key={sub.href} href={sub.href} onClick={() => setIsOpen( false )} className={`block py-1.5 text-sm transition-colors ${pathname === sub.href ? 'text-[#F4A261]' : 'text-white/70 hover:text-white'}`}>
                  {sub.label}
                </Link>
              ) )}
            </div>

            {/* Avoid Zone */}
            <Link href="/avoid" onClick={() => setIsOpen( false )} className={`flex items-center gap-1.5 font-medium py-2 transition-colors ${pathname === '/avoid' ? 'text-[#E63946]' : 'text-white/90 hover:text-[#E63946]'}`}>
              <ShieldAlert className="w-4 h-4" />
              Chanmei Zone
            </Link>

            {/* Contact & About */}
            <Link href="/contact" onClick={() => setIsOpen( false )} className={`block font-medium py-2 transition-colors ${pathname === '/contact' ? 'text-[#F4A261]' : 'text-white/90 hover:text-[#F4A261]'}`}>
              Contact
            </Link>
            <Link href="/about" onClick={() => setIsOpen( false )} className={`block font-medium py-2 transition-colors ${pathname === '/about' ? 'text-[#F4A261]' : 'text-white/90 hover:text-[#F4A261]'}`}>
              About
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
