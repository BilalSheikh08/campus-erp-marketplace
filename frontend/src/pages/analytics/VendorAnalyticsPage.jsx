/**
 * Campus Commons - Vendor Analytics & Sales Intelligence
 * University Merchant Audit & Sales Ledger:
 * Settlement revenue, counter order volume, ticket averages, and item rankings.
 */

import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { fetchVendorAnalytics } from '../../services/analyticsApi';
import Button from '../../components/shared/Button';
import Alert from '../../components/shared/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';

function dateString(date) { return date.toISOString().slice(0, 10); }
function money(value) { return `₹${Number(value || 0).toFixed(2)}`; }
function toNiceDate(value) { return value ? new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : value; }

export default function VendorAnalyticsPage() {
  const [range, setRange] = useState(() => ({ end: new Date(), start: new Date(Date.now() - 29 * 86400000) }));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      setData(await fetchVendorAnalytics({ start_date: dateString(range.start), end_date: dateString(range.end) }));
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not load vendor analytics.');
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => { load(); }, [load]);

  if (loading && !data) return <LoadingSpinner message="Aggregating merchant sales ledger..." />;

  const summary = data?.summary || {};
  const sales = (data?.sales_by_day || []).map((item) => ({ ...item, label: toNiceDate(item.date) }));
  const topItems = data?.top_items || [];

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-zinc-900 py-10 pb-24 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation & Masthead */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-5 border-b border-[#E4DDCF]">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-zinc-700" />
              <span>MERCHANT DISPATCH · FISCAL AUDIT LEDGER</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-zinc-950 tracking-tight">
              Sales Volume &amp; Settlement
            </h1>
            <p className="text-zinc-600 text-xs sm:text-sm mt-1 font-sans">
              Audited transaction volume, express pickup settlement totals, and item performance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link to="/vendor/dashboard">
              <Button variant="outline" size="sm" className="text-xs flex items-center gap-1.5">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Order Desk</span>
              </Button>
            </Link>
            <div className="flex items-center gap-1.5 bg-white border border-[#E4DDCF] p-1 rounded">
              <input
                type="date"
                value={dateString(range.start)}
                onChange={(e) => setRange((c) => ({ ...c, start: new Date(e.target.value) }))}
                className="text-xs px-2 py-1 bg-transparent border-0 font-mono text-zinc-800 focus:outline-none"
              />
              <span className="text-[10px] font-mono text-zinc-400">TO</span>
              <input
                type="date"
                value={dateString(range.end)}
                onChange={(e) => setRange((c) => ({ ...c, end: new Date(e.target.value) }))}
                className="text-xs px-2 py-1 bg-transparent border-0 font-mono text-zinc-800 focus:outline-none"
              />
            </div>
            <Button size="sm" variant="primary" onClick={load} className="text-xs font-bold">
              Filter
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6">
            <Alert type="error" message={error} dismissible onClose={() => setError('')} />
          </div>
        )}

        {/* Metric Summary Ledger */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-[#E4DDCF] p-5 shadow-xs">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 block">
              Gross Concession Revenue
            </span>
            <p className="text-2xl font-mono font-bold text-zinc-950 mt-1.5">{money(summary.total_revenue)}</p>
            <p className="text-[11px] font-mono text-zinc-500 mt-1">Settled pickup orders</p>
          </div>
          <div className="bg-white rounded-lg border border-[#E4DDCF] p-5 shadow-xs">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 block">
              Total Processed Orders
            </span>
            <p className="text-2xl font-mono font-bold text-zinc-950 mt-1.5">{summary.total_orders || 0}</p>
            <p className="text-[11px] font-mono text-zinc-500 mt-1">Dispensed at counter</p>
          </div>
          <div className="bg-white rounded-lg border border-[#E4DDCF] p-5 shadow-xs">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 block">
              Average Order Value
            </span>
            <p className="text-2xl font-mono font-bold text-zinc-950 mt-1.5">{money(summary.average_order_value)}</p>
            <p className="text-[11px] font-mono text-zinc-500 mt-1">Per pickup docket</p>
          </div>
          <div className="bg-white rounded-lg border border-[#E4DDCF] p-5 shadow-xs">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 block">
              Active Catalog Items
            </span>
            <p className="text-2xl font-mono font-bold text-zinc-950 mt-1.5">{summary.active_listings || 0}</p>
            <p className="text-[11px] font-mono text-zinc-500 mt-1">In customer directory</p>
          </div>
        </div>

        {/* Charts & Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          <div className="lg:col-span-8 bg-white rounded-lg border border-[#E4DDCF] p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-5 border-b border-[#E4DDCF]">
              <h3 className="font-serif font-bold text-base text-zinc-950">Settlement Revenue Trajectory</h3>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">30-Day Audit Period</span>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sales}>
                  <CartesianGrid strokeDasharray="2 2" stroke="#E4DDCF" vertical={false} />
                  <XAxis dataKey="label" stroke="#71717A" fontSize={10} fontFamily="monospace" tickLine={false} />
                  <YAxis stroke="#71717A" fontSize={10} fontFamily="monospace" tickLine={false} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E4DDCF', borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace' }}
                    formatter={(val) => [`₹${val}`, 'Revenue']}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#1E3A8A" strokeWidth={2} dot={{ fill: '#1E3A8A', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white rounded-lg border border-[#E4DDCF] p-5 shadow-xs">
            <div className="pb-3 mb-4 border-b border-[#E4DDCF]">
              <h3 className="font-serif font-bold text-base text-zinc-950">Top Selling Concessions</h3>
              <p className="text-[11px] font-mono text-zinc-500 mt-0.5">Highest volume items</p>
            </div>
            <div className="space-y-2.5">
              {topItems.length > 0 ? (
                topItems.map((item, idx) => (
                  <div key={idx} className="p-3 rounded border border-[#E4DDCF] bg-[#FAF8F3] flex justify-between items-center text-xs">
                    <div>
                      <p className="font-serif font-bold text-zinc-950">{item.title}</p>
                      <p className="text-[10px] font-mono text-zinc-500">{item.units_sold} units dispensed</p>
                    </div>
                    <span className="font-mono font-bold text-sm text-zinc-950">{money(item.revenue)}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-zinc-400 py-8 text-center font-mono">No sales data recorded in this period.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
