/**
 * Campus Commons - Marketplace Department Directory
 * Comprehensive directory for Canteen Dining, Stationery Depot,
 * Hostel Supplies, and Used Textbooks.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Utensils,
  Package,
  Building2,
  BookOpen,
  ArrowRight,
  Search,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import Button from '../../components/shared/Button';

export default function MarketplaceLandingPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const departments = [
    {
      id: 'canteen',
      title: 'Canteen Dining Hall',
      subtitle: 'Fast Pre-Orders & Counter Pickups',
      description: 'Hot student meals, vegetarian thalis, sandwiches, rolls, and beverages. Beat noon crowds with digital 4-digit token collection.',
      icon: Utensils,
      path: '/marketplace/canteen',
      features: ['Skip lunch queues', '4-digit token PIN', 'Fresh kitchen prep tracking'],
      accent: 'border-orange-200 bg-orange-50 text-orange-600',
      tag: 'Express Dining',
    },
    {
      id: 'stationery',
      title: 'Stationery Depot',
      subtitle: 'Examination Blue Books & Drawing Sets',
      description: 'Official university examination sheets, lab manuals, engineering drafters, and scientific calculators.',
      icon: Package,
      path: '/marketplace/stationery',
      features: ['Official university paper', 'Engineering grade tools', 'Direct campus pricing'],
      accent: 'border-sky-200 bg-sky-50 text-sky-600',
      tag: 'Academic Supplies',
    },
    {
      id: 'hostel_supply',
      title: 'Hostel Logistics',
      subtitle: 'Warden-Approved Residence Amenities',
      description: 'Room mattresses, study lamps, cleaning equipment, and room key maintenance verified by residence staff.',
      icon: Building2,
      path: '/marketplace/hostel_supply',
      features: ['Warden approval pipeline', 'Campus room delivery', 'Transparent ledger logs'],
      accent: 'border-emerald-200 bg-emerald-50 text-emerald-600',
      tag: 'Hostel Living',
    },
    {
      id: 'books',
      title: 'Used Books Exchange',
      subtitle: 'Student P2P Textbook Exchange',
      description: 'Buy and sell second-hand engineering, medical, and literature textbooks directly with campus peers with zero commission.',
      icon: BookOpen,
      path: '/books',
      features: ['0% platform commission', 'Peer campus meetup', 'Verified student sellers'],
      accent: 'border-purple-200 bg-purple-50 text-purple-600',
      tag: 'Peer Marketplace',
    },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/marketplace/all?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Masthead */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 mb-10 shadow-sm">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-2.5">
            <Sparkles className="h-4 w-4" />
            <span>Campus Concessions &amp; Clearinghouse</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Campus Marketplace
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
            Select a specialized campus department below to browse catalog items, view live stock availability, and place orders with counter collection.
          </p>

          {/* Quick Search */}
          <form onSubmit={handleSearch} className="mt-6 flex flex-col sm:flex-row gap-2.5 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search across all campus concessions..."
                className="w-full pl-11 pr-4 py-3 text-sm bg-slate-50 rounded-2xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition"
              />
            </div>
            <Button type="submit" variant="blue" className="py-3 px-6 rounded-2xl font-bold text-sm">
              Search All
            </Button>
          </form>
        </div>

        {/* 4 Large Department Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {departments.map((dept) => {
            const DeptIcon = dept.icon;
            return (
              <div
                key={dept.id}
                className="bg-white rounded-3xl border border-slate-200 p-8 flex flex-col justify-between hover:border-slate-300 shadow-sm hover:shadow-lg transition duration-200 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-xs ${dept.accent}`}>
                      <DeptIcon className="h-7 w-7" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {dept.tag}
                    </span>
                  </div>

                  <h2 className="text-2xl font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {dept.title}
                  </h2>
                  <p className="text-xs font-semibold text-blue-600 mt-1">{dept.subtitle}</p>
                  <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
                    {dept.description}
                  </p>

                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                      Department Highlights
                    </p>
                    <ul className="space-y-2">
                      {dept.features.map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-2.5 text-xs text-slate-700">
                          <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100">
                  <Link to={dept.path} className="w-full block">
                    <Button
                      variant="default"
                      className="w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-between group-hover:bg-blue-600 transition-colors"
                    >
                      <span>Enter {dept.title}</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
