'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, MapPin } from 'lucide-react';

export default function Navbar()
{
  const [ isOpen, setIsOpen ] = useState( false );

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/attractions', label: 'Attractions' },
    { href: '/restaurants', label: 'Restaurants' },
    { href: '/othercities', label: 'Other Cities' }, // York, Cambridge, Oxford, Reading, Edinburgh, Glasgow
    { href: '/about', label: 'About' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1D3557]/95 backdrop-blur-sm shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-[#E63946] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">
              Discover<span className="text-[#F4A261]">London</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map( ( link ) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-white/90 hover:text-[#F4A261] font-medium transition-colors relative group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#F4A261] transition-all group-hover:w-full" />
              </Link>
            ) )}
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

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-[#1D3557] border-t border-white/10">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map( ( link ) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen( false )}
                className="block text-white/90 hover:text-[#F4A261] font-medium py-2 transition-colors"
              >
                {link.label}
              </Link>
            ) )}
          </div>
        </div>
      )}
    </nav>
  );
}
