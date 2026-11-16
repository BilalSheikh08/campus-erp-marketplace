/**
 * Campus Commons / Exchange Footer
 * University publication colophon, concessions directory, and student services links.
 */

import { Link } from 'react-router-dom';
import { ArrowUpRight, Landmark, MapPin, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#18181B] text-[#D4D4D8] pt-16 pb-12 border-t border-zinc-800 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-zinc-800">
          {/* Brand Colophon */}
          <div className="md:col-span-5 pr-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded bg-white text-zinc-950 flex items-center justify-center font-serif text-lg font-bold shadow-xs">
                <span>U</span>
              </div>
              <span className="font-serif font-bold text-xl tracking-tight text-white">
                CAMPUS<span className="text-blue-400">HUB</span>
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mb-4">
              The official centralized clearinghouse and marketplace for university concessions. Operating express counter pre-orders, verified academic stationery, residence hall supply logistics, and peer textbook exchanges.
            </p>
            <div className="space-y-1.5 text-[11px] text-zinc-400 font-mono">
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span>Central Campus Quadrangle &amp; Concession Annex</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Service Counters: Mon–Sat 08:00 – 21:00</span>
              </div>
            </div>
          </div>

          {/* Department Directory */}
          <div className="md:col-span-2">
            <h4 className="font-mono font-bold text-[11px] uppercase tracking-wider text-white mb-3 pb-1 border-b border-zinc-800">
              Concessions
            </h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li><Link to="/marketplace/canteen" className="hover:text-amber-400 transition">Canteen Dining</Link></li>
              <li><Link to="/marketplace/stationery" className="hover:text-sky-400 transition">Stationery Depot</Link></li>
              <li><Link to="/marketplace/hostel_supply" className="hover:text-emerald-400 transition">Hostel Logistics</Link></li>
              <li><Link to="/books" className="hover:text-purple-400 transition">Used Textbooks</Link></li>
            </ul>
          </div>

          {/* Student Desk */}
          <div className="md:col-span-2">
            <h4 className="font-mono font-bold text-[11px] uppercase tracking-wider text-white mb-3 pb-1 border-b border-zinc-800">
              Student Desk
            </h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li><Link to="/cart" className="hover:text-white transition">Active Cart Slip</Link></li>
              <li><Link to="/orders" className="hover:text-white transition">4-Digit Pickup PINs</Link></li>
              <li><Link to="/hostel-requests" className="hover:text-white transition">Room Requisitions</Link></li>
              <li><Link to="/books/new" className="hover:text-white transition">Sell Textbooks</Link></li>
            </ul>
          </div>

          {/* Administration & Permits */}
          <div className="md:col-span-3">
            <h4 className="font-mono font-bold text-[11px] uppercase tracking-wider text-white mb-3 pb-1 border-b border-zinc-800">
              Administration
            </h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <Link to="/become-vendor" className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-medium transition">
                  <Landmark className="h-3.5 w-3.5" />
                  Apply for Vendor Permit
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </li>
              <li><Link to="/about" className="hover:text-white transition">System Architecture</Link></li>
              <li><Link to="/contact" className="hover:text-white transition">Campus Concessions Board</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
          <p>© 2026 Campus Hub Digital Marketplace. University Official Clearinghouse.</p>
          <div className="flex gap-6 font-mono text-[11px]">
            <Link to="/about" className="hover:text-zinc-300 transition">Regulations &amp; Rules</Link>
            <Link to="/contact" className="hover:text-zinc-300 transition">Superintendent Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
