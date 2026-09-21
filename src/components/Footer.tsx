import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import Logo from './Logo';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black border-t border-white/10 pt-16 pb-8 px-6 sm:px-10 md:px-14">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Logo size={32} />
            <span className="text-white text-xl font-playfair italic">HF Traders</span>
          </div>
          <p className="text-sm text-white/60 leading-relaxed max-w-[220px]">
            Trusted scrap trading and metal recycling partner for industries across the region.
          </p>
        </div>

        <div>
          <h4 className="text-white text-sm font-semibold mb-4 uppercase tracking-wide">Company</h4>
          <ul className="flex flex-col gap-2.5 text-sm text-white/60">
            <li><Link to="/products" className="hover:text-white transition-colors">Products</Link></li>
            <li><Link to="/guidance" className="hover:text-white transition-colors">Guidance</Link></li>
            <li><Link to="/scrap-study" className="hover:text-white transition-colors">Scrap Study</Link></li>
            <li><Link to="/business-plans" className="hover:text-white transition-colors">Business Plans</Link></li>
            <li><Link to="/live-tour" className="hover:text-white transition-colors">Live Tour</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white text-sm font-semibold mb-4 uppercase tracking-wide">Contact</h4>
          <ul className="flex flex-col gap-3 text-sm text-white/60">
            <li className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0 text-[#e8702a]" />
              Industrial Area, Sundar Road, Lahore, Pakistan
            </li>
            <li className="flex items-center gap-2">
              <Phone size={16} className="shrink-0 text-[#e8702a]" />
              0301-2059933
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} className="shrink-0 text-[#e8702a]" />
              hanifusman695@gmail.com
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white text-sm font-semibold mb-4 uppercase tracking-wide">Business Hours</h4>
          <p className="flex items-start gap-2 text-sm text-white/60">
            <Clock size={16} className="mt-0.5 shrink-0 text-[#e8702a]" />
            Mon – Sat, 8:00 AM – 7:00 PM
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto border-t border-white/10 mt-10 pt-6 flex items-center justify-between text-xs text-white/40">
        <span>© {new Date().getFullYear()} HF Traders. All rights reserved.</span>
        <Link to="/admin/login" className="hover:text-white/60 transition-colors">
          Admin
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
