import { useCallback, useEffect, useState } from 'react';
import { Activity, BarChart3, BookOpen, Boxes, Users, ArrowLeft, Calendar, DollarSign, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { fetchAdminAnalytics } from '../../services/analyticsApi';
import Button from '../../components/shared/Button';
import Alert from '../../components/shared/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';

function dateString(date) { return date.toISOString().slice(0, 10); }
function money(value) { return `₹${Number(value || 0).toFixed(2)}`; }

export default function AdminAnalyticsPage() {
  const navigate = useNavigate();
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
  if (loading && !data) return <LoadingSpinner message="Aggregating campus enterprise metrics..." />;

  const summary = data?.summary || {};
  const categorySales = (data?.category_sales || []).map((item) => ({ ...item, name: item.category.replace('_', ' ') }));
  const roles = (data?.users_by_role || []).map((item) => ({ ...item, name: item.role }));
  const status = data?.order_status || [];

  return (
    <div className="min-h-screen bg-slate-50 py-8 pb-20 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate('/admin/dashboard')}
          className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Governance Console
        </button>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <BarChart3 className="h-7 w-7 text-blue-600" />
              <span>Campus Enterprise Analytics</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Cross-domain transaction volume, hostel logistics throughput, and user census.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <input
                type="date"
                value={dateString(range.start)}
                max={dateString(range.end)}
                onChange={(e) => setRange((r) => ({ ...r, start: new Date(`${e.target.value}T00:00:00`) }))}
                className="bg-transparent text-slate-900 focus:outline-none"
              />
              <span className="text-slate-400">to</span>
              <input
                type="date"
                value={dateString(range.end)}
                min={dateString(range.start)}
                onChange={(e) => setRange((r) => ({ ...r, end: new Date(`${e.target.value}T00:00:00`) }))}
                className="bg-transparent text-slate-900 focus:outline-none"
              />
            </div>
            <Button variant="outline" size="sm" onClick={load} className="text-xs border-slate-200">
              Refresh
            </Button>
          </div>
        </div>

        {error && <div className="mb-6"><Alert type="error" message={error} dismissible onClose={() => setError('')} /></div>}

        {/* Global Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            ['Gross Transaction Value', money(summary.revenue), DollarSign, 'text-blue-600', 'bg-blue-50'],
            ['Completed Orders', summary.orders || 0, ShoppingBag, 'text-emerald-600', 'bg-emerald-50'],
            ['Student Book Resales', money(summary.book_sales_value), BookOpen, 'text-purple-600', 'bg-purple-50'],
            ['Low Stock Alerts', summary.low_stock_items || 0, Boxes, 'text-amber-600', 'bg-amber-50'],
          ].map(([label, value, Icon, colorClass, bgClass]) => (
            <div key={label} className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
                <p className="text-2xl font-black mt-1 font-mono text-slate-900">{value}</p>
              </div>
              <div className={`w-11 h-11 rounded-xl ${bgClass} flex items-center justify-center`}>
                <Icon className={`h-5 w-5 ${colorClass}`} />
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" />
              <span>Gross Revenue by Concession Department</span>
            </h2>
            {categorySales.length === 0 ? (
              <p className="text-xs text-slate-400 py-20 text-center">No sales completed in this time window.</p>
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categorySales}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                    <Tooltip
                      formatter={(value, key) => key === 'revenue' ? money(value) : value}
                      contentStyle={{ backgroundColor: '#0F172A', color: '#F8FAFC', borderRadius: '8px', border: 'none', fontSize: '12px' }}
                    />
                    <Bar dataKey="revenue" fill="#2563EB" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* User Distribution */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-600" />
              <span>Active Campus User Census</span>
            </h2>
            {roles.length === 0 ? (
              <p className="text-xs text-slate-400 py-20 text-center">No user directory data available.</p>
            ) : (
              <div className="space-y-4 pt-2">
                {roles.map((item) => {
                  const maxCount = Math.max(1, ...roles.map((r) => r.count));
                  const pct = Math.round((item.count / maxCount) * 100);
                  return (
                    <div key={item.role}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="capitalize font-semibold text-slate-800">{item.name}</span>
                        <span className="font-mono text-slate-500 font-semibold">{item.count} users</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Status Distribution Strips */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Order Status Pipeline</h2>
            <div className="space-y-2">
              {status.map((item) => (
                <div key={item.status} className="flex justify-between items-center py-2 text-xs border-b border-slate-50 last:border-0">
                  <span className="capitalize text-slate-600 font-medium">{item.status}</span>
                  <span className="font-bold font-mono text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-full">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Hostel Requisitions</h2>
            <div className="space-y-2">
              {(data?.hostel_request_status || []).map((item) => (
                <div key={item.status} className="flex justify-between items-center py-2 text-xs border-b border-slate-50 last:border-0">
                  <span className="capitalize text-slate-600 font-medium">{item.status.replace('_', ' ')}</span>
                  <span className="font-bold font-mono text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-full">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Book P2P Transactions</h2>
            <div className="space-y-2">
              {(data?.book_transaction_status || []).map((item) => (
                <div key={item.status} className="flex justify-between items-center py-2 text-xs border-b border-slate-50 last:border-0">
                  <span className="capitalize text-slate-600 font-medium">{item.status}</span>
                  <span className="font-bold font-mono text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-full">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
