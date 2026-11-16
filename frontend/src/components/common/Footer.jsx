/**
 * Campus Commons / Exchange Footer
 * Comprehensive university marketplace, concessions directory, and student services links.
 */

import { Link } from 'react-router-dom';
import { ArrowUpRight, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Column */}
          <div className="md:col-span-5 pr-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-lg shadow-sm border border-blue-400/30">
                <span className="font-editorial text-white">U</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-white">
                CAMPUS<span className="text-blue-400">HUB</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              The official centralized marketplace and logistics clearinghouse for campus dining, course stationery supplies, warden-supervised residence requisitions, and student-to-student textbook exchanges.
            </p>
            <div className="mt-5 flex items-center gap-2 text-[11px] text-slate-400 bg-slate-800/60 px-3 py-1.5 rounded-full border border-slate-700/60 w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Campus Local Dispatch &amp; Express Pickups Active</span>
            </div>
          </div>

          {/* Directory Links */}
          <div className="md:col-span-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-white mb-4">
              Departments
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/marketplace/canteen" className="hover:text-amber-400 transition">Canteen Dining</Link></li>
              <li><Link to="/marketplace/stationery" className="hover:text-blue-400 transition">Stationery Depot</Link></li>
              <li><Link to="/marketplace/hostel_supply" className="hover:text-emerald-400 transition">Hostel Logistics</Link></li>
              <li><Link to="/books" className="hover:text-purple-400 transition">Used Textbooks</Link></li>
            </ul>
          </div>

          {/* Student Services */}
          <div className="md:col-span-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-white mb-4">
              Student Desk
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/cart" className="hover:text-white transition">Active Cart</Link></li>
              <li><Link to="/orders" className="hover:text-white transition">Pickup PIN Tokens</Link></li>
              <li><Link to="/hostel-requests" className="hover:text-white transition">Room Requisitions</Link></li>
              <li><Link to="/books/new" className="hover:text-white transition">Sell Textbooks</Link></li>
            </ul>
          </div>

          {/* Administration & Permits */}
          <div className="md:col-span-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-white mb-4">
              Administration &amp; Permits
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/become-vendor" className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-semibold transition">
                  <Sparkles className="h-3.5 w-3.5" />
                  Apply as Merchant Vendor
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </li>
              <li><Link to="/about" className="hover:text-white transition">Platform Architecture</Link></li>
              <li><Link to="/contact" className="hover:text-white transition">Campus Concession Inquiries</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 Campus Hub Digital Marketplace. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/about" className="hover:text-slate-300 transition">Privacy &amp; Rules</Link>
            <Link to="/contact" className="hover:text-slate-300 transition">Help Desk</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
