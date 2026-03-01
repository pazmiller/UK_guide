import Link from 'next/link';
import { MapPin, Mail } from 'lucide-react';

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
                Discover<span className="text-[#F4A261]">GB</span>
              </span>
            </Link>
            <p className="text-white/70 mb-4 max-w-md">
              英国与欧洲的美食、景点与生活指南。发现最好的餐厅、景点和隐藏的宝藏。
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-[#F4A261]">Explore</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/london" className="text-white/70 hover:text-white transition-colors">
                  London
                </Link>
              </li>
              <li>
                <Link href="/othercities" className="text-white/70 hover:text-white transition-colors">
                  Other Cities
                </Link>
              </li>
              <li>
                <Link href="/europa" className="text-white/70 hover:text-white transition-colors">
                  Europa
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-white/70 hover:text-white transition-colors">
                  About
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
                <span>hello@discovergb.uk</span>
              </li>
              <li>
                <Link href="/contact" className="text-white/70 hover:text-white transition-colors">
                  反馈建议
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 text-center text-white/50 text-sm">
          <p>&copy; {new Date().getFullYear()} DiscoverGB. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
