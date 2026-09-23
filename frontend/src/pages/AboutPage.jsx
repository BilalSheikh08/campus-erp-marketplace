/**
 * About Page - comprehensive platform documentation and technical overview.
 */

import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Zap,
  Layers,
  Database,
  ArrowRight,
  Code2,
  CheckCircle2,
} from 'lucide-react';
import Button from '../components/shared/Button';

export default function AboutPage() {
  const pillars = [
    {
      icon: Layers,
      title: 'One Engine, Four Skins',
      description:
        'Rather than deploying separate fragmented applications for dining, supplies, and accommodation, our architecture unifies listings, orders, carts, inventory, permissions, and audit logs into a single enterprise engine.',
    },
    {
      icon: Zap,
      title: 'Transactional Concurrency',
      description:
        'Campus rush hours create immense transaction density. We employ database-level row locking with select_for_update() to prevent overselling, race conditions, or duplicate book claims.',
    },
    {
      icon: Database,
      title: 'Immutable Order & Audit Trails',
      description:
        'Every checkout takes a point-in-time price snapshot. Order and hostel requisition status changes are persisted in unalterable audit logs for administrative compliance.',
    },
    {
      icon: ShieldCheck,
      title: 'Role-Isolated Governance',
      description:
        'Granular permissions divide Students, Campus Vendors, Hostel Wardens, and University Administrators. Cross-user object mutations strictly return HTTP 403 Forbidden.',
    },
  ];

  const techStack = [
    { name: 'Django 5.0 & DRF 3.15', role: 'High-performance Python backend & REST API' },
    { name: 'Django Channels & Redis', role: 'Real-time WebSocket notification pipeline' },
    { name: 'PostgreSQL & Docker', role: 'ACID-compliant relational database storage' },
    { name: 'React 18 & Vite', role: 'Ultra-fast, modular Single Page Application' },
    { name: 'Tailwind CSS', role: 'Modern, responsive utility-first design system' },
    { name: 'Zustand & Axios', role: 'Lightweight reactive state & automatic JWT refresh' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header / Hero */}
      <section className="bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <span className="text-indigo-400 font-bold text-xs uppercase tracking-widest bg-indigo-500/10 px-3.5 py-1.5 rounded-full border border-indigo-500/20">
            About Campus ERP
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mt-6 mb-6">
            The Digital Backbone of Campus Commerce
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Eliminating canteen lunch lines, replacing paper hostel registers, and empowering students to circulate textbooks—engineered as a single high-concurrency university ecosystem.
          </p>
        </div>
      </section>

      {/* Origin & Problem Solved */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-sm">
          <div className="max-w-3xl">
            <span className="text-indigo-600 font-bold text-xs uppercase tracking-widest">
              The Vision
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2 mb-6">
              Why Campus ERP was created
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Traditional universities juggle fragmented systems: food pre-ordering is nonexistent or crowded around a single register; stationery supplies require multiple cash trips; hostel equipment requests are buried in manual paper ledgers; and student book resale is scattered across unreliable messaging groups.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Campus ERP solves this by unifying four distinct university domains around one battle-tested transaction engine. By pairing real-time notifications with server-authoritative inventory checks, students and staff enjoy effortless campus life with zero administrative friction.
            </p>
          </div>
        </div>
      </section>

      {/* Architectural Pillars */}
      <section className="py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-indigo-600 font-bold text-xs uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              Core Engineering
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-4">
              Architectural Principles
            </h2>
            <p className="mt-3 text-slate-600">
              Designed with enterprise security and rock-solid consistency at its foundation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="p-8 rounded-3xl bg-slate-50/70 border border-slate-200 hover:border-indigo-300 transition-colors"
                >
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-6 shadow-md shadow-indigo-600/20">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{pillar.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{pillar.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tech Stack Matrix */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            <Code2 className="h-4 w-4" />
            <span>Modern Technology Stack</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-4">
            Powered by Leading Technologies
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {techStack.map((tech, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-start gap-4"
            >
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900 text-base">{tech.name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{tech.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-indigo-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
            Experience the Marketplace Today
          </h2>
          <p className="text-indigo-200 mb-8 max-w-xl mx-auto text-base">
            Start browsing available products, textbooks, and campus supplies right now.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/marketplace">
              <Button size="lg" className="bg-white text-indigo-900 hover:bg-indigo-50 font-bold rounded-2xl flex items-center gap-2">
                <span>Browse Products</span>
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="secondary" size="lg" className="bg-indigo-800 text-white border-white/20 rounded-2xl">
                Contact Campus Support
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
