/**
 * Campus Commons - Marketplace Department Directory
 * Redesigned with university directory folio aesthetic:
 * warm paper background, serif headings, department code stamps,
 * and clear feature lists.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Utensils,
  Package,
  Building2,
  BookOpen,
  ArrowRight,
  Search,
  CheckCircle,
  Landmark,
} from 'lucide-react';
import Button from '../../components/shared/Button';

export default function MarketplaceLandingPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const departments = [
    {
      id: 'canteen',
      title: 'Canteen Dining Hall',
      code: 'ANNEX-A',
      subtitle: 'Fast Pre-Orders & Counter Pickups',
      description: 'Hot student meals, vegetarian thalis, sandwiches, rolls, and beverages. Beat noon crowds with digital 4-digit token collection.',
      icon: Utensils,
      path: '/marketplace/canteen',
      features: ['Skip lunch queues', '4-digit token PIN', 'Fresh kitchen prep tracking'],
      accent: 'border-amber-300 bg-amber-50 text-amber-900',
      tag: 'Express Dining',
    },
    {
      id: 'stationery',
      title: 'Stationery Depot',
      code: 'BLOCK-02',
      subtitle: 'Examination Blue Books & Drawing Sets',
      description: 'Official university examination sheets, lab manuals, engineering drafters, and scientific calculators.',
      icon: Package,
      path: '/marketplace/stationery',
      features: ['Official university paper', 'Engineering grade tools', 'Direct campus pricing'],
      accent: 'border-sky-300 bg-sky-50 text-sky-900',
      tag: 'Academic Supplies',
    },
    {
      id: 'hostel_supply',
      title: 'Hostel Logistics',
      code: 'RES-01',
      subtitle: 'Warden-Approved Residence Amenities',
      description: 'Room mattresses, study lamps, cleaning equipment, and room key maintenance verified by residence staff.',
      icon: Building2,
      path: '/marketplace/hostel_supply',
      features: ['Warden approval pipeline', 'Campus room delivery', 'Transparent ledger logs'],
      accent: 'border-emerald-300 bg-emerald-50 text-emerald-900',
      tag: 'Hostel Living',
    },
    {
      id: 'books',
      title: 'Used Books Exchange',
      code: 'LIB-WEST',
      subtitle: 'Student P2P Textbook Exchange',
      description: 'Buy and sell second-hand engineering, medical, and literature textbooks directly with campus peers with zero commission.',
      icon: BookOpen,
      path: '/books',
      features: ['0% platform commission', 'Peer campus meetup', 'Verified student sellers'],
      accent: 'border-purple-300 bg-purple-50 text-purple-900',
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
    <div className="min-h-screen bg-[#F8F6F0] text-zinc-900 py-10 pb-24 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Masthead */}
        <div className="bg-[#FAF8F3] rounded-lg border border-[#E4DDCF] p-6 sm:p-10 mb-8 shadow-xs">
          <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-2">
            <Landmark className="h-3.5 w-3.5" />
            <span>CAMPUS CLEARINGHOUSE · DEPARTMENT DIRECTORY</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-normal text-zinc-950 tracking-tight">
            Official Campus Concessions
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-zinc-600 max-w-2xl leading-relaxed font-sans">
            Select a specialized campus concession department below to inspect verified inventory, examine real-time counter stock, and issue express pre-orders.
          </p>

          {/* Quick Search */}
          <form onSubmit={handleSearch} className="mt-5 flex flex-col sm:flex-row gap-2 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search across all campus concession catalogs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 bg-white rounded border border-[#E4DDCF] focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900/20 font-sans"
              />
            </div>
            <Button type="submit" variant="primary" size="md" className="text-xs">
              Search Index
            </Button>
          </form>
        </div>

        {/* Department Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {departments.map((dept) => {
            const Icon = dept.icon;
            return (
              <div
                key={dept.id}
                className="bg-white rounded-lg border border-[#E4DDCF] p-6 sm:p-7 shadow-xs hover:border-zinc-400 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded bg-[#FAF8F3] text-zinc-900 border border-[#E4DDCF]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">
                          CONCESSION {dept.code}
                        </span>
                        <h2 className="font-serif text-xl font-bold text-zinc-950">
                          {dept.title}
                        </h2>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-[#E4DDCF] bg-[#FAF8F3] text-zinc-700">
                      {dept.tag}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-600 leading-relaxed mb-5 font-sans">
                    {dept.description}
                  </p>

                  <div className="space-y-1.5 mb-6 pt-3 border-t border-[#E4DDCF]">
                    {dept.features.map((feat) => (
                      <div key={feat} className="flex items-center gap-2 text-xs font-mono text-zinc-600">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={() => navigate(dept.path)}
                    variant="outline"
                    className="w-full text-xs font-semibold py-2.5 rounded border-[#E4DDCF] hover:bg-[#FAF8F3] flex items-center justify-between"
                  >
                    <span>Open Department Catalog</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
