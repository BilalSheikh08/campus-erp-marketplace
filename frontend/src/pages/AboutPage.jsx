/**
 * Campus Commons - Platform Architecture & Engineering Overview
 * Deep-dive into technical architecture, four domains, and platform mission.
 */

import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Zap,
  Layers,
  Database,
  Code2,
  Sparkles,
} from 'lucide-react';
import Button from '../components/shared/Button';

export default function AboutPage() {
  const pillars = [
    {
      icon: Layers,
      title: 'Unified Campus Engine',
      description:
        'Rather than maintaining fragmented silos for dining, stationery, and dorm logistics, our clearinghouse unifies listings, orders, atomic inventory, and verification into one integrated platform.',
    },
    {
      icon: Zap,
      title: 'Atomic Stock Protection',
      description:
        'High lunch break traffic creates heavy concurrency. Database row-level locks ensure that meal portions and course textbook listings cannot be double-booked or oversold.',
    },
    {
      icon: Database,
      title: 'Immutable Audit Trail',
      description:
        'Every checkout preserves an immutable price snapshot and timeline audit log. Every status change from preparation to pickup is permanently recorded.',
    },
    {
      icon: ShieldCheck,
      title: 'Role-Based Governance',
      description:
        'Strict permissions separate Students, Campus Merchants, Residence Wardens, and SuperAdmins, ensuring end-to-end data isolation and security.',
    },
  ];

  const techStack = [
    { name: 'Django 5.0 & DRF', role: 'Enterprise Python backend & REST API' },
    { name: 'PostgreSQL 16', role: 'ACID transactional database with row-level locks' },
    { name: 'React 18 & Vite', role: 'Fast, modular single-page interface' },
    { name: 'Tailwind CSS', role: 'Design token architecture with accessible contrast' },
    { name: 'Zustand & Axios', role: 'Client state management & JWT lifecycle' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-slate-950 via-[#0A1128] to-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-semibold text-slate-300">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Platform Blueprint</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Architecture &amp; Mission
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Engineered to streamline campus daily life: eliminating long lunch queues, guaranteeing authentic course stationery, and facilitating trusted peer exchange.
          </p>
        </div>
      </section>

      {/* 4 Architectural Pillars */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((pil, idx) => {
            const Icon = pil.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5 border border-blue-200">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{pil.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{pil.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Technology Stack Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Code2 className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Core Technical Stack
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {techStack.map((tech, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="font-bold text-slate-900 text-sm">{tech.name}</p>
                <p className="text-xs text-slate-500 mt-1">{tech.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 text-center">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">Ready to explore?</h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-6">
            Browse live campus listings or create an account to start pre-ordering.
          </p>
          <div className="flex justify-center gap-3">
            <Link to="/marketplace">
              <Button variant="blue" size="lg" className="px-6 font-bold">
                Enter Marketplace
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="lg" className="px-6 font-bold bg-slate-800 text-white border-slate-700 hover:bg-slate-700">
                Contact Directory
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
