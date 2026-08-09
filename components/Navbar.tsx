'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X, MapPin, Building, Utensils, ChevronDown, ShieldAlert } from 'lucide-react';

interface NavbarProps
{
  citiesSubLinks: NavLink[];
  europaSubLinks: NavLink[];
}

interface NavLink
{
    href: string;
    label: string;
}

export default function Navbar( { citiesSubLinks, europaSubLinks }: NavbarProps )
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
  const isOnGuide = pathname.startsWith( '/guide' );
  const isOnContribute = pathname.startsWith( '/contribute' );

  const londonSubLinks = [
    { href: '/london/attractions', label: 'Attractions', icon: Building },
    { href: '/london/restaurants', label: 'Restaurants', icon: Utensils },
  ];

  /* shared pill classes */
  const pill = 'rounded-full px-3 py-1.5 transition-[background-color,color,box-shadow,transform] duration-200';
  const activePill = `${pill} bg-white/42 text-black shadow-[inset_0_1px_0_rgba(255,255,255,0.74),inset_0_-10px_18px_rgba(255,255,255,0.18),0_8px_22px_rgba(29,53,87,0.12)] ring-1 ring-white/55`;
  const hoverPill = `${pill} text-black/82 hover:bg-white/28 hover:text-black hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.58),0_6px_18px_rgba(29,53,87,0.10)]`;
  const activeRedPill = `${pill} bg-[#E63946]/80 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.38),0_8px_20px_rgba(230,57,70,0.22)] ring-1 ring-white/40`;
  const hoverRedPill = `${pill} text-[#7F1D1D] hover:bg-[#E63946]/12 hover:text-[#E63946] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.54)]`;

  /* dropdown animation classes */
  const dropdownBase = 'absolute top-full left-1/2 z-50 -translate-x-1/2 pt-3 transition-[opacity,transform] duration-200 ease-out origin-top';
  const dropdownOpen = 'opacity-100 scale-100 translate-y-0 pointer-events-auto';
  const dropdownClosed = 'opacity-0 scale-95 -translate-y-1 pointer-events-none';

  return (
    <>
      <svg className="fixed h-0 w-0 overflow-hidden" aria-hidden="true" focusable="false">
        <filter id="liquid-nav-filter" colorInterpolationFilters="sRGB" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.018" numOctaves="2" seed="17" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="7" xChannelSelector="R" yChannelSelector="G" result="displaced" />
          <feGaussianBlur in="displaced" stdDeviation="0.16" result="softened" />
        </filter>
      </svg>

      <style>{`
        @keyframes liquidGlint {
          0%, 100% { opacity: 0.58; transform: translate3d(-9%, -7%, 0) scale(1.04); }
          50%      { opacity: 0.86; transform: translate3d(7%, 5%, 0) scale(1.08); }
        }

        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-10px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .liquid-glass {
          --glass-bg: rgba(255, 255, 255, 0.22);
          --glass-edge: rgba(255, 255, 255, 0.54);
          --glass-shadow: rgba(29, 53, 87, 0.16);
          --glass-blur: 18px;
          --glass-saturate: 1.9;
          position: relative;
          isolation: isolate;
          overflow: hidden;
          border-color: var(--glass-edge);
          background:
            linear-gradient(135deg, rgba(255,255,255,0.56), rgba(255,255,255,0.15) 36%, rgba(255,255,255,0.34)),
            var(--glass-bg);
          backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate)) brightness(1.08);
          backdrop-filter: url(#liquid-nav-filter) blur(var(--glass-blur)) saturate(var(--glass-saturate)) brightness(1.08);
          -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate)) brightness(1.08);
          box-shadow:
            0 18px 56px var(--glass-shadow),
            0 2px 18px rgba(29,53,87,0.08),
            inset 0 1px 0 rgba(255,255,255,0.82),
            inset 0 -1px 0 rgba(255,255,255,0.34),
            inset 0 -24px 42px rgba(255,255,255,0.15);
        }

        .liquid-glass::before {
          content: "";
          position: absolute;
          inset: -35%;
          z-index: 0;
          border-radius: inherit;
          background:
            radial-gradient(circle at 22% 16%, rgba(255,255,255,0.88), transparent 18%),
            radial-gradient(circle at 82% 24%, rgba(244,162,97,0.22), transparent 22%),
            radial-gradient(circle at 68% 92%, rgba(42,157,143,0.16), transparent 24%),
            linear-gradient(115deg, transparent 18%, rgba(255,255,255,0.55) 32%, transparent 47%);
          mix-blend-mode: screen;
          opacity: 0.7;
          pointer-events: none;
          animation: liquidGlint 9s ease-in-out infinite;
        }

        .liquid-glass::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 0;
          padding: 1px;
          border-radius: inherit;
          background:
            linear-gradient(135deg, rgba(255,255,255,0.96), rgba(255,255,255,0.18) 32%, rgba(29,53,87,0.16) 58%, rgba(255,255,255,0.74));
          -webkit-mask:
            linear-gradient(#000 0 0) content-box,
            linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask:
            linear-gradient(#000 0 0) content-box,
            linear-gradient(#000 0 0);
          mask-composite: exclude;
          pointer-events: none;
        }

        .liquid-glass > * {
          position: relative;
          z-index: 1;
        }

        .liquid-glass.nav-liquid-shell {
          overflow: visible;
        }

        .liquid-glass.nav-liquid-shell::before {
          inset: 0;
          clip-path: inset(0 round 28px);
        }

        .liquid-glass--scrolled {
          --glass-bg: rgba(255, 255, 255, 0.34);
          --glass-edge: rgba(255, 255, 255, 0.62);
          --glass-shadow: rgba(29, 53, 87, 0.18);
          --glass-blur: 22px;
        }

        .liquid-glass--menu {
          --glass-bg: rgba(255, 255, 255, 0.30);
          --glass-edge: rgba(255, 255, 255, 0.58);
          --glass-shadow: rgba(29, 53, 87, 0.22);
          --glass-blur: 20px;
        }

        @media (prefers-reduced-motion: reduce) {
          .liquid-glass::before {
            animation: none;
          }
        }
      `}</style>

      <nav className="fixed top-3 left-0 right-0 z-50 px-3 transition-[opacity,transform] duration-300 sm:px-4">
        {/* Main Nav Row */}
        <div className={`liquid-glass nav-liquid-shell relative z-30 mx-auto max-w-7xl rounded-[28px] border px-4 transition-[background-color,border-color,box-shadow] duration-300 sm:px-6 lg:px-8 ${scrolled
          ? 'liquid-glass--scrolled'
          : ''
          }`}>
          <div className="flex h-[64px] items-center justify-between">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-[18px] border border-white/56 bg-white/34 shadow-[inset_0_1px_0_rgba(255,255,255,0.72),inset_0_-10px_18px_rgba(255,255,255,0.16),0_10px_24px_rgba(29,53,87,0.14)] transition-[transform,background-color,box-shadow] duration-200 group-hover:scale-[1.04] group-hover:bg-white/48">
                <MapPin className="w-6 h-6 text-[#E63946]" />
              </div>
              <span className="text-black font-black text-xl tracking-tighter drop-shadow-[0_1px_0_rgba(255,255,255,0.58)]">
                CFFA<span className="text-[#F4A261]">UK</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">

              {/* Home */}
              <Link href="/" className={`font-medium text-sm ${pathname === '/' ? activePill : hoverPill}`}>
                Home
              </Link>

              <Link href="/guide" className={`hidden lg:inline-flex font-medium text-sm ${isOnGuide ? activePill : hoverPill}`}>
                赴英提醒
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
                  <div className="liquid-glass liquid-glass--menu min-w-[190px] overflow-hidden rounded-[22px] border">
                    {londonSubLinks.map( ( sub ) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className={`flex items-center gap-3 px-5 py-3 text-sm font-medium transition-[background-color,color,padding,border-color] duration-150
                          border-l-2 hover:pl-[22px]
                          ${pathname === sub.href
                            ? 'text-[#E63946] bg-white/58 border-[#E63946]'
                            : 'text-black/82 hover:bg-white/48 border-transparent hover:border-[#E63946] hover:text-black'}`}
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
                  <div className="liquid-glass liquid-glass--menu min-w-[190px] overflow-hidden rounded-[22px] border">
                    {citiesSubLinks.map( ( sub ) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className={`block px-5 py-3 text-sm font-medium transition-[background-color,color,padding,border-color] duration-150
                          border-l-2 hover:pl-[22px]
                          ${pathname === sub.href
                            ? 'text-[#E63946] bg-white/58 border-[#E63946]'
                            : 'text-black/82 hover:bg-white/48 border-transparent hover:border-[#E63946] hover:text-black'}`}
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
                  <div className="liquid-glass liquid-glass--menu min-w-[190px] overflow-hidden rounded-[22px] border">
                    {europaSubLinks.map( ( sub ) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className={`block px-5 py-3 text-sm font-medium transition-[background-color,color,padding,border-color] duration-150
                          border-l-2 hover:pl-[22px]
                          ${pathname === sub.href
                            ? 'text-[#E63946] bg-white/58 border-[#E63946]'
                            : 'text-black/82 hover:bg-white/48 border-transparent hover:border-[#E63946] hover:text-black'}`}
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

              {/* 兽聚Furcon讯息 */}
              <Link href="/furcon" className={`font-medium text-sm ${pathname === '/furcon' ? activePill : hoverPill}`}>
                兽聚Furcon
              </Link>
              {/* Contact */}
              <Link href="/contact" className={`font-medium text-sm ${pathname === '/contact' ? activePill : hoverPill}`}>
                Contact
              </Link>

              <Link href="/contribute" className={`font-medium text-sm ${isOnContribute ? activePill : hoverPill}`}>
                出一份力！
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen( !isOpen )}
              className="md:hidden rounded-full border border-white/50 bg-white/32 p-2 text-black shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] transition-colors hover:bg-white/48"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* London Sub-Nav Bar */}
        {isOnLondon && (
          <div className="mt-2 hidden md:block">
            <div className="liquid-glass liquid-glass--menu mx-auto max-w-7xl rounded-2xl border px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-1 h-10">
                {londonSubLinks.map( ( sub ) => (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    className={`flex items-center gap-2 px-4 h-full text-sm font-medium transition-colors border-b-2 ${pathname.startsWith( sub.href )
                      ? 'text-[#E63946] border-[#E63946]'
                      : 'text-black/72 border-transparent hover:text-black hover:border-black/30'
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
          <div className="liquid-glass liquid-glass--menu mx-auto mt-2 max-w-7xl rounded-[24px] border md:hidden">
            <div className="px-4 py-4 space-y-0.5">
              {( [
                { href: '/', label: 'Home', exact: true },
                { href: '/guide', label: '赴英提醒', exact: true },
              ] as const ).map( ( item, i ) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen( false )}
                  style={{ animation: 'slideInLeft 0.2s ease forwards', animationDelay: `${i * 40}ms`, opacity: 0 }}
                  className={`block font-medium py-2 px-3 rounded-xl transition-colors ${pathname === item.href ? 'text-black bg-white/58 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]' : 'text-black/82 hover:text-black hover:bg-white/42'}`}
                >
                  {item.label}
                </Link>
              ) )}

              {/* London */}
              <div style={{ animation: 'slideInLeft 0.2s ease forwards', animationDelay: '40ms', opacity: 0 }}>
                <Link href="/london" onClick={() => setIsOpen( false )} className={`block font-medium py-2 px-3 rounded-xl transition-colors ${isOnLondon ? 'text-black bg-white/58 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]' : 'text-black/82 hover:text-black hover:bg-white/42'}`}>
                  London
                </Link>
                <div className="pl-4 space-y-0.5 border-l border-black/12 ml-3 mt-0.5 mb-1">
                  {londonSubLinks.map( ( sub, i ) => (
                    <Link key={sub.href} href={sub.href} onClick={() => setIsOpen( false )}
                      style={{ animation: 'slideInLeft 0.2s ease forwards', animationDelay: `${( i + 2 ) * 40}ms`, opacity: 0 }}
                      className={`flex items-center gap-2 py-1.5 px-2 rounded-lg text-sm transition-colors ${pathname.startsWith( sub.href ) ? 'text-[#E63946]' : 'text-black/68 hover:text-black'}`}
                    >
                      <sub.icon className="w-3.5 h-3.5" />
                      {sub.label}
                    </Link>
                  ) )}
                </div>
              </div>

              {/* Other Cities */}
              <div style={{ animation: 'slideInLeft 0.2s ease forwards', animationDelay: '200ms', opacity: 0 }}>
                <Link href="/othercities" onClick={() => setIsOpen( false )} className={`block font-medium py-2 px-3 rounded-xl transition-colors ${isOnCities ? 'text-black bg-white/58 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]' : 'text-black/82 hover:text-black hover:bg-white/42'}`}>
                  Other Cities
                </Link>
                <div className="pl-4 space-y-0.5 border-l border-black/12 ml-3 mt-0.5 mb-1">
                  {citiesSubLinks.map( ( sub, i ) => (
                    <Link key={sub.href} href={sub.href} onClick={() => setIsOpen( false )}
                      style={{ animation: 'slideInLeft 0.2s ease forwards', animationDelay: `${( i + 6 ) * 40}ms`, opacity: 0 }}
                      className={`block py-1.5 px-2 rounded-lg text-sm transition-colors ${pathname === sub.href ? 'text-[#E63946]' : 'text-black/68 hover:text-black'}`}
                    >
                      {sub.label}
                    </Link>
                  ) )}
                </div>
              </div>

              {/* Europa */}
              <div style={{ animation: 'slideInLeft 0.2s ease forwards', animationDelay: '400ms', opacity: 0 }}>
                <Link href="/europa" onClick={() => setIsOpen( false )} className={`block font-medium py-2 px-3 rounded-xl transition-colors ${isOnEuropa ? 'text-black bg-white/58 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]' : 'text-black/82 hover:text-black hover:bg-white/42'}`}>
                  Europa
                </Link>
                <div className="pl-4 space-y-0.5 border-l border-black/12 ml-3 mt-0.5 mb-1">
                  {europaSubLinks.map( ( sub, i ) => (
                    <Link key={sub.href} href={sub.href} onClick={() => setIsOpen( false )}
                      style={{ animation: 'slideInLeft 0.2s ease forwards', animationDelay: `${( i + 11 ) * 40}ms`, opacity: 0 }}
                      className={`block py-1.5 px-2 rounded-lg text-sm transition-colors ${pathname === sub.href ? 'text-[#E63946]' : 'text-black/68 hover:text-black'}`}
                    >
                      {sub.label}
                    </Link>
                  ) )}
                </div>
              </div>

              {/* No Good */}
              <div style={{ animation: 'slideInLeft 0.2s ease forwards', animationDelay: '640ms', opacity: 0 }}>
                <Link href="/avoid" onClick={() => setIsOpen( false )} className={`flex items-center gap-1.5 font-medium py-2 px-3 rounded-xl transition-colors ${pathname === '/avoid' ? 'text-[#E63946] bg-[#E63946]/13' : 'text-[#7F1D1D] hover:text-[#E63946] hover:bg-[#E63946]/10'}`}>
                  <ShieldAlert className="w-4 h-4" />
                  No Good
                </Link>
              </div>

              {/* Contact & Contribute */}
              {[ { href: '/contact', label: 'Contact', delay: 680 }, { href: '/contribute', label: '出一份力！', delay: 720 } ].map( ( item ) => (
                <div key={item.href} style={{ animation: 'slideInLeft 0.2s ease forwards', animationDelay: `${item.delay}ms`, opacity: 0 }}>
                  <Link href={item.href} onClick={() => setIsOpen( false )} className={`block font-medium py-2 px-3 rounded-xl transition-colors ${pathname === item.href ? 'text-black bg-white/58 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]' : 'text-black/82 hover:text-black hover:bg-white/42'}`}>
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
