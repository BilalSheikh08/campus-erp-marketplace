/**
 * Campus Commons - Enterprise Analytics Hub
 * Central Registrar Financial & Institutional Volume Intelligence:
 * Cross-domain transaction volume, category breakdowns, and census distribution.
 */

import { useCallback, useEffect, useState } from 'react';
import { BarChart3, BookOpen, Boxes, ArrowLeft, Calendar, DollarSign, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { fetchAdminAnalytics } from '../../services/analyticsApi';
import Button from '../../components/shared/Button';
import Alert from '../../components/shared/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';

function dateString(date) { return date.toISOString().slice(0, 10); }
function money(value) { return `₹${Number(value || 0).toFixed(2)}`; }

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState(() => ({ end: new Date(), start: new Date(Date.now() - 29 * 86400000) }));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      setData(await fetchAdminAnalytics({ start_date: dateString(range.start), end_date: dateString(range.end) }));
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not load admin analytics.');
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => { load(); }, [load]);
  if (loading && !data) return <LoadingSpinner message="Aggregating campus clearinghouse enterprise metrics..." />;

  const summary = data?.summary || {};
  const categorySales = (data?.category_sales || []).map((item) => ({ ...item, name: item.category.replace('_', ' ') }));
  const roles = (data?.users_by_role || []).map((item) => ({ ...item, name: item.role }));

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-zinc-900 py-10 pb-24 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Masthead */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-5 border-b border-[#E4DDCF]">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
              <BarChart3 className="h-3.5 w-3.5 text-zinc-700" />
              <span>CENTRAL REGISTRAR · ENTERPRISE INTELLIGENCE</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-zinc-950 tracking-tight">
              Campus Enterprise Analytics
            </h1>
            <p className="text-zinc-600 text-xs sm:text-sm mt-1 font-sans">
              Cross-domain transaction volume, concession throughput, and campus user census.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link to="/admin/dashboard">
              <Button variant="outline" size="sm" className="text-xs flex items-center gap-1.5">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Governance Console</span>
              </Button>
            </Link>
            <div className="flex items-center gap-1.5 bg-white border border-[#E4DDCF] p-1 rounded font-mono text-xs">
              <Calendar className="h-3.5 w-3.5 text-zinc-400" />
              <input
                type="date"
                value={dateString(range.start)}
                max={dateString(range.end)}
                onChange={(e) => setRange((r) => ({ ...r, start: new Date(`${e.target.value}T00:00:00`) }))}
                className="bg-transparent text-zinc-900 focus:outline-none"
              />
              <span className="text-zinc-400 text-[10px]">TO</span>
              <input
                type="date"
                value={dateString(range.end)}
                min={dateString(range.start)}
                onChange={(e) => setRange((r) => ({ ...r, end: new Date(`${e.target.value}T00:00:00`) }))}
                className="bg-transparent text-zinc-900 focus:outline-none"
              />
            </div>
            <Button variant="primary" size="sm" onClick={load} className="text-xs font-bold">
              Filter
            </Button>
          </div>
        </div>

        {error && <div className="mb-6"><Alert type="error" message={error} dismissible onClose={() => setError('')} /></div>}

        {/* Global Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            ['Gross Transaction Value', money(summary.revenue), DollarSign, 'text-zinc-950'],
            ['Completed Orders', summary.orders || 0, ShoppingBag, 'text-zinc-950'],
            ['Student Book Resales', money(summary.book_sales_value), BookOpen, 'text-zinc-950'],
            ['Low Stock Alerts', summary.low_stock_items || 0, Boxes, 'text-amber-900'],
          ].map(([label, value, Icon, colorClass]) => (
            <div key={label} className="bg-white rounded-lg border border-[#E4DDCF] p-5 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">{label}</p>
                <p className={`text-2xl font-mono font-bold mt-1.5 ${colorClass}`}>{value}</p>
              </div>
              <div className="w-10 h-10 rounded bg-[#FAF8F3] border border-[#E4DDCF] flex items-center justify-center text-zinc-700">
                <Icon className="h-4.5 w-4.5" />
              </div>
            </div>
          ))}
        </div>

        {/* Charts & Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          <div className="lg:col-span-8 bg-white rounded-lg border border-[#E4DDCF] p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-5 border-b border-[#E4DDCF]">
              <h3 className="font-serif font-bold text-base text-zinc-950">Revenue by Campus Department</h3>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">30-Day Period</span>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categorySales}>
                  <CartesianGrid strokeDasharray="2 2" stroke="#E4DDCF" vertical={false} />
                  <XAxis dataKey="name" stroke="#71717A" fontSize={10} fontFamily="monospace" tickLine={false} />
                  <YAxis stroke="#71717A" fontSize={10} fontFamily="monospace" tickLine={false} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E4DDCF', borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace' }}
                    formatter={(val) => [`₹${val}`, 'Sales']}
                  />
                  <Bar dataKey="revenue" fill="#1E3A8A" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white rounded-lg border border-[#E4DDCF] p-5 shadow-xs">
            <div className="pb-3 mb-4 border-b border-[#E4DDCF]">
              <h3 className="font-serif font-bold text-base text-zinc-950">Campus User Census</h3>
              <p className="text-[11px] font-mono text-zinc-500 mt-0.5">Active registered account roles</p>
            </div>
            <div className="space-y-2.5">
              {roles.length > 0 ? (
                roles.map((r, idx) => (
                  <div key={idx} className="p-3 rounded border border-[#E4DDCF] bg-[#FAF8F3] flex justify-between items-center text-xs">
                    <span className="font-mono font-bold text-zinc-950 uppercase text-[11px]">{r.name}</span>
                    <span className="font-mono text-xs text-zinc-700 font-semibold">{r.count} users</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-zinc-400 py-6 text-center font-mono">No census data recorded.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
