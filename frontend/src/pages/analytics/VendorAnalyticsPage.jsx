/**
 * Campus Commons - Vendor Analytics & Sales Intelligence
 * Revenue trends, daily order volume, item performance, and status distribution.
 */

import { useCallback, useEffect, useState } from 'react';
import { BarChart3, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { fetchVendorAnalytics } from '../../services/analyticsApi';
import Button from '../../components/shared/Button';
import Alert from '../../components/shared/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';

function dateString(date) { return date.toISOString().slice(0, 10); }
function money(value) { return `₹${Number(value || 0).toFixed(2)}`; }
function toNiceDate(value) { return value ? new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : value; }

export default function VendorAnalyticsPage() {
  const navigate = useNavigate();
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

  if (loading && !data) return <LoadingSpinner message="Aggregating sales analytics..." />;

  const summary = data?.summary || {};
  const sales = (data?.sales_by_day || []).map((item) => ({ ...item, label: toNiceDate(item.date) }));
  const topItems = data?.top_items || [];

  return (
    <div className="min-h-screen bg-slate-50 py-10 pb-24 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate('/vendor/dashboard')}
          className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Merchant Desk
        </button>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <BarChart3 className="h-7 w-7 text-blue-600" /> Merchant Sales Analytics
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Live order volume, settlement revenue, and best-selling menu items.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateString(range.start)}
              onChange={(e) => setRange((c) => ({ ...c, start: new Date(e.target.value) }))}
              className="text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white"
            />
            <span className="text-xs text-slate-400">to</span>
            <input
              type="date"
              value={dateString(range.end)}
              onChange={(e) => setRange((c) => ({ ...c, end: new Date(e.target.value) }))}
              className="text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white"
            />
            <Button size="sm" variant="blue" onClick={load} className="font-bold">
              Filter
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6">
            <Alert type="error" message={error} dismissible onClose={() => setError('')} />
          </div>
        )}

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Gross Revenue</p>
            <p className="text-3xl font-mono font-extrabold text-slate-900 mt-2">{money(summary.total_revenue)}</p>
            <p className="text-xs text-slate-500 mt-1">Settled orders</p>
          </div>
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Total Orders</p>
            <p className="text-3xl font-mono font-extrabold text-slate-900 mt-2">{summary.total_orders || 0}</p>
            <p className="text-xs text-slate-500 mt-1">Processed transactions</p>
          </div>
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Average Order Value</p>
            <p className="text-3xl font-mono font-extrabold text-slate-900 mt-2">{money(summary.average_order_value)}</p>
            <p className="text-xs text-slate-500 mt-1">Per transaction ticket</p>
          </div>
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-purple-600">Active Listings</p>
            <p className="text-3xl font-mono font-extrabold text-slate-900 mt-2">{summary.active_listings || 0}</p>
            <p className="text-xs text-slate-500 mt-1">In customer catalog</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <h3 className="font-bold text-base text-slate-900 mb-6">Revenue Trend (30 Days)</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sales}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip formatter={(val) => [`₹${val}`, 'Revenue']} />
                  <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} dot={{ fill: '#2563eb', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <h3 className="font-bold text-base text-slate-900 mb-4">Top Selling Items</h3>
            <div className="space-y-3">
              {topItems.length > 0 ? (
                topItems.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{item.title}</p>
                      <p className="text-slate-500">{item.units_sold} sold</p>
                    </div>
                    <span className="font-mono font-extrabold text-blue-600">{money(item.revenue)}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-6 text-center">No sales data recorded in this period.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
