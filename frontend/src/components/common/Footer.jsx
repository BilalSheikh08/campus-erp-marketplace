/**
 * Comprehensive Application Footer Component.
 * Displays campus platform branding, domain links, portal shortcuts,
 * support contact, and real-time operational status.
 */

import { Link } from 'react-router-dom';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  Heart,
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          {/* Col 1 & 2: Platform Mission */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                <span className="font-extrabold text-lg">C</span>
              </div>
              <span className="font-extrabold text-white text-xl tracking-tight">
                Campus<span className="text-indigo-400">ERP</span> Hub
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed mb-6 max-w-sm">
              An enterprise-grade hybrid ERP and marketplace connecting university students, campus merchants, and residence authorities through high-concurrency transactional workflows.
            </p>

            {/* Live Status Pill */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-slate-300 font-medium">All Services Operational</span>
              <span className="text-slate-600">•</span>
              <span className="text-indigo-400 font-mono">99.9% Uptime</span>
            </div>
          </div>

          {/* Col 3: Marketplaces */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">
              Marketplaces
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/marketplace/canteen" className="hover:text-white transition-colors">
                  🍽️ Canteen Express
                </Link>
              </li>
              <li>
                <Link to="/marketplace/stationery" className="hover:text-white transition-colors">
                  📚 Stationery Depot
                </Link>
              </li>
              <li>
                <Link to="/marketplace/hostel_supply" className="hover:text-white transition-colors">
                  🏠 Hostel Supplies
                </Link>
              </li>
              <li>
                <Link to="/books" className="hover:text-white transition-colors">
                  📖 Used Books Exchange
                </Link>
              </li>
              <li>
                <Link to="/marketplace" className="hover:text-indigo-400 font-semibold text-indigo-400 transition-colors">
                  Browse All Catalog &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Role Portals */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">
              Campus Portals
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Student Portal
                </Link>
              </li>
              <li>
                <Link to="/become-vendor" className="hover:text-white transition-colors">
                  Vendor Onboarding
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Warden Approvals
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  University Admin
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  Architecture & Docs
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Support & Counter Info */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">
              Help & Counters
            </h4>
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>Central Campus Food Court & Student Center</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-indigo-400 shrink-0" />
                <span>Counters: 08:00 – 21:00 Daily</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-indigo-400 shrink-0" />
                <a href="mailto:support@campus.university.edu" className="hover:text-white transition-colors">
                  support@campus.university.edu
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-indigo-400 shrink-0" />
                <span>Campus Helpline: Ext. 4402</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Security Note */}
        <div className="mt-8 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Secure Enterprise Architecture • Django REST Framework + Channels + React</span>
          </div>

          <div className="flex items-center gap-1">
            <span>&copy; {new Date().getFullYear()} Campus ERP Marketplace. Engineered with</span>
            <Heart className="h-3.5 w-3.5 text-red-500 inline fill-red-500" />
            <span>for University Commerce.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
