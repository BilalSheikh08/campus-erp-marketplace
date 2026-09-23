import { useCallback, useEffect, useState } from 'react';
import { Activity, BarChart3, BookOpen, Boxes, Users } from 'lucide-react';
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
    try { setData(await fetchAdminAnalytics({ start_date: dateString(range.start), end_date: dateString(range.end) })); }
    catch (err) { setError(err.response?.data?.detail || 'Could not load admin analytics.'); }
    finally { setLoading(false); }
  }, [range]);

  useEffect(() => { load(); }, [load]);
  if (loading && !data) return <LoadingSpinner message="Loading admin analytics..." />;

  const summary = data?.summary || {};
  const categorySales = (data?.category_sales || []).map((item) => ({ ...item, name: item.category.replace('_', ' ') }));
  const roles = (data?.users_by_role || []).map((item) => ({ ...item, name: item.role }));
  const status = data?.order_status || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8"><div><p className="text-sm font-medium text-primary mb-1">Administration</p><h1 className="text-3xl font-bold text-gray-900">System Analytics</h1><p className="text-gray-600 mt-1">Marketplace, hostel, books, inventory, and users.</p></div><div className="flex gap-2"><input type="date" value={dateString(range.start)} max={dateString(range.end)} onChange={(e) => setRange((r) => ({ ...r, start: new Date(`${e.target.value}T00:00:00`) }))} className="rounded-lg border bg-white px-3 py-2" /><input type="date" value={dateString(range.end)} min={dateString(range.start)} onChange={(e) => setRange((r) => ({ ...r, end: new Date(`${e.target.value}T00:00:00`) }))} className="rounded-lg border bg-white px-3 py-2" /><Button variant="secondary" onClick={load}>Refresh</Button></div></div>
      {error && <div className="mb-6"><Alert type="error" message={error} dismissible onClose={() => setError('')} /></div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">{[['Revenue', money(summary.revenue), Activity], ['Orders', summary.orders || 0, BarChart3], ['Book sales', money(summary.book_sales_value), BookOpen], ['Low stock', summary.low_stock_items || 0, Boxes]].map(([label, value, Icon]) => <div key={label} className="bg-white rounded-xl border shadow-sm p-5 flex justify-between"><div><p className="text-sm text-gray-500">{label}</p><p className="text-2xl font-bold text-gray-900 mt-1">{value}</p></div><Icon className="h-6 w-6 text-primary/50" /></div>)}</div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border shadow-sm p-5"><h2 className="font-semibold text-gray-900 mb-4">Sales by category</h2>{categorySales.length === 0 ? <p className="text-sm text-gray-500 py-12 text-center">No completed sales.</p> : <div className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={categorySales}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip formatter={(value, key) => key === 'revenue' ? money(value) : value} /><Bar dataKey="revenue" fill="currentColor" /></BarChart></ResponsiveContainer></div>}</div>
        <div className="bg-white rounded-xl border shadow-sm p-5"><h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Users className="h-5 w-5" /> Users by role</h2>{roles.length === 0 ? <p className="text-sm text-gray-500 py-12 text-center">No user data.</p> : <div className="space-y-3">{roles.map((item) => <div key={item.role}><div className="flex justify-between text-sm mb-1"><span className="capitalize text-gray-600">{item.name}</span><span className="font-semibold text-gray-900">{item.count}</span></div><div className="h-2 rounded-full bg-gray-100 overflow-hidden"><div className="h-full bg-primary" style={{ width: `${Math.min(100, item.count / Math.max(1, Math.max(...roles.map((r) => r.count))) * 100)}%` }} /></div></div>)}</div>}</div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="bg-white rounded-xl border shadow-sm p-5"><h2 className="font-semibold text-gray-900 mb-4">Order status</h2><div className="space-y-3">{status.map((item) => <div key={item.status} className="flex justify-between py-2 border-b last:border-0"><span className="capitalize text-gray-600">{item.status}</span><span className="font-semibold">{item.count}</span></div>)}</div></div>
        <div className="bg-white rounded-xl border shadow-sm p-5"><h2 className="font-semibold text-gray-900 mb-4">Hostel request status</h2><div className="space-y-3">{(data?.hostel_request_status || []).map((item) => <div key={item.status} className="flex justify-between py-2 border-b last:border-0"><span className="capitalize text-gray-600">{item.status.replace('_', ' ')}</span><span className="font-semibold">{item.count}</span></div>)}</div></div>
        <div className="bg-white rounded-xl border shadow-sm p-5"><h2 className="font-semibold text-gray-900 mb-4">Book transaction status</h2><div className="space-y-3">{(data?.book_transaction_status || []).map((item) => <div key={item.status} className="flex justify-between py-2 border-b last:border-0"><span className="capitalize text-gray-600">{item.status}</span><span className="font-semibold">{item.count}</span></div>)}</div></div>
      </div>
    </div></div>
  );
}
