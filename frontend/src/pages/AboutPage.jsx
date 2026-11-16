/**
 * Campus Commons - Platform Architecture & Engineering Overview
 * University Central Exchange Technical Overview & Architectural Charter:
 * Concurrency controls, database row-locks, role isolation, and academic clearinghouse principles.
 */

import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Zap,
  Layers,
  Database,
  Code2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import Button from '../components/shared/Button';

export default function AboutPage() {
  const pillars = [
    {
      icon: Layers,
      title: 'Unified Clearinghouse Engine',
      description:
        'Rather than maintaining fragmented silos for dining, stationery, and dorm logistics, our clearinghouse unifies listings, orders, atomic inventory, and token verification into one coherent campus service platform.',
    },
    {
      icon: Zap,
      title: 'Atomic Concession Stock Locks',
      description:
        'High lunch rush periods create heavy concurrency. Database row-level locks ensure that hot meal portions, examination blue books, and course textbook reservations cannot be double-booked or oversold.',
    },
    {
      icon: Database,
      title: 'Immutable Ledger Audit Trail',
      description:
        'Every checkout preserves an immutable rate snapshot and timeline audit log. Every status change from kitchen prep to physical 4-digit PIN counter pickup is permanently recorded.',
    },
    {
      icon: ShieldCheck,
      title: 'Strict Role-Based Governance',
      description:
        'Rigorous access boundaries partition Students, Merchant Concessionaires, Residence Wardens, and SuperAdmins, ensuring end-to-end data integrity and role-specific workflows.',
    },
  ];

  const techStack = [
    { name: 'Django 5.0 & DRF', role: 'Enterprise Python backend & robust transactional REST API' },
    { name: 'PostgreSQL 16', role: 'ACID transactional engine with row-level locks' },
    { name: 'React 18 & Vite', role: 'Fast, modular single-page campus interface' },
    { name: 'Tailwind CSS', role: 'University publication design tokens and readable typography' },
    { name: 'Zustand & Axios', role: 'Client state management & secure JWT lifecycle' },
  ];

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-zinc-900 pb-24 font-sans">
      {/* Masthead Banner */}
      <section className="bg-[#FAF8F3] border-b border-[#E4DDCF] py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500">
            <Sparkles className="h-3.5 w-3.5 text-zinc-700" />
            <span>INSTITUTIONAL CHARTER · CLEARINGHOUSE BLUEPRINT</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-normal text-zinc-950 tracking-tight">
            Platform Architecture &amp; Mission
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 max-w-2xl mx-auto leading-relaxed font-sans">
            Engineered to streamline daily campus logistics: eliminating congested canteen queues, guaranteeing authentic coursework supplies, and facilitating trusted peer exchange.
          </p>
        </div>
      </section>

      {/* 4 Architectural Pillars */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((pil, idx) => {
            const Icon = pil.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-lg border border-[#E4DDCF] p-7 shadow-xs hover:border-zinc-400 transition-colors"
              >
                <div className="w-10 h-10 rounded bg-[#FAF8F3] border border-[#E4DDCF] text-zinc-800 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-serif font-bold text-lg text-zinc-950 mb-1.5">{pil.title}</h3>
                <p className="text-xs text-zinc-600 leading-relaxed font-sans">{pil.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Technical Stack Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="bg-white rounded-lg border border-[#E4DDCF] p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-[#E4DDCF]">
            <Code2 className="h-5 w-5 text-zinc-700" />
            <h2 className="font-serif font-bold text-xl text-zinc-950">
              Core Technical Infrastructure
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {techStack.map((tech) => (
              <div key={tech.name} className="p-4 rounded border border-[#E4DDCF] bg-[#FAF8F3]">
                <h4 className="font-mono font-bold text-xs text-zinc-950 uppercase">{tech.name}</h4>
                <p className="text-xs text-zinc-600 mt-1 font-sans">{tech.role}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-[#E4DDCF] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-zinc-500 font-mono">
              Campus Clearinghouse v2.4 • Academic Year 2026-2027
            </p>
            <Link to="/marketplace">
              <Button variant="primary" size="sm" className="text-xs font-bold font-mono flex items-center gap-1.5">
                <span>Explore Concession Catalog</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
