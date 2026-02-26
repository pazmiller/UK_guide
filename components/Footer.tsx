import Link from 'next/link';
import { MapPin, Mail, Phone, Instagram, Twitter, Facebook } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#1D3557] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-[#E63946] rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl">
                Discover<span className="text-[#F4A261]">London</span>
              </span>
            </Link>
            <p className="text-white/70 mb-4 max-w-md">
              Your ultimate guide to exploring London and the United Kingdom.
              Discover the best attractions, restaurants, and hidden gems.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-white/70 hover:text-[#F4A261] transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-white/70 hover:text-[#F4A261] transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-white/70 hover:text-[#F4A261] transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-[#F4A261]">Explore</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/attractions" className="text-white/70 hover:text-white transition-colors">
                  Tourist Attractions
                </Link>
              </li>
              <li>
                <Link href="/restaurants" className="text-white/70 hover:text-white transition-colors">
                  Restaurants & Dining
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-white/70 hover:text-white transition-colors">
                  About London
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-[#F4A261]">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-white/70">
                <Mail className="w-4 h-4" />
                <span>hello@discoverlondon.com</span>
              </li>
              <li className="flex items-center gap-2 text-white/70">
                <Phone className="w-4 h-4" />
                <span>+44 20 1234 5678</span>
              </li>
              <li className="flex items-center gap-2 text-white/70">
                <MapPin className="w-4 h-4" />
                <span>London, United Kingdom</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 text-center text-white/50 text-sm">
          <p>&copy; {new Date().getFullYear()} DiscoverLondon. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
