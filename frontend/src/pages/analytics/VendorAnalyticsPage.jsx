import { useCallback, useEffect, useState } from 'react';
import { BarChart3, Package, ShoppingCart, TrendingUp, AlertTriangle } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
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
    try { setData(await fetchVendorAnalytics({ start_date: dateString(range.start), end_date: dateString(range.end) })); }
    catch (err) { setError(err.response?.data?.detail || 'Could not load vendor analytics.'); }
    finally { setLoading(false); }
  }, [range]);

  useEffect(() => { load(); }, [load]);

  if (loading && !data) return <LoadingSpinner message="Loading analytics..." />;

  const summary = data?.summary || {};
  const sales = (data?.sales_by_day || []).map((item) => ({ ...item, label: toNiceDate(item.date) }));
  const topItems = data?.top_items || [];
  const status = data?.order_status || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8"><div><p className="text-sm font-medium text-primary mb-1">Vendor ERP</p><h1 className="text-3xl font-bold text-gray-900">Sales Analytics</h1><p className="text-gray-600 mt-1">Live aggregates from completed marketplace orders.</p></div><div className="flex gap-2"><input type="date" value={dateString(range.start)} max={dateString(range.end)} onChange={(e) => setRange((r) => ({ ...r, start: new Date(`${e.target.value}T00:00:00`) }))} className="rounded-lg border bg-white px-3 py-2" /><input type="date" value={dateString(range.end)} min={dateString(range.start)} onChange={(e) => setRange((r) => ({ ...r, end: new Date(`${e.target.value}T00:00:00`) }))} className="rounded-lg border bg-white px-3 py-2" /><Button variant="secondary" onClick={load}>Refresh</Button></div></div>
        {error && <div className="mb-6"><Alert type="error" message={error} dismissible onClose={() => setError('')} /></div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[['Revenue', money(summary.revenue), TrendingUp], ['Orders', summary.orders || 0, ShoppingCart], ['Items sold', summary.items_sold || 0, Package], ['Low stock', summary.low_stock_items || 0, AlertTriangle]].map(([label, value, Icon]) => <div key={label} className="bg-white rounded-xl border shadow-sm p-5 flex justify-between"><div><p className="text-sm text-gray-500">{label}</p><p className="text-2xl font-bold text-gray-900 mt-1">{value}</p></div><Icon className="h-6 w-6 text-primary/50" /></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border shadow-sm p-5"><div className="flex items-center gap-2 mb-4"><BarChart3 className="h-5 w-5 text-primary" /><h2 className="font-semibold text-gray-900">Revenue trend</h2></div>{sales.length === 0 ? <p className="text-sm text-gray-500 py-16 text-center">No completed sales in this period.</p> : <div className="h-80"><ResponsiveContainer width="100%" height="100%"><LineChart data={sales}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="label" /><YAxis /><Tooltip formatter={(value) => money(value)} /><Line type="monotone" dataKey="revenue" stroke="currentColor" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer></div>}</div>
          <div className="bg-white rounded-xl border shadow-sm p-5"><h2 className="font-semibold text-gray-900 mb-4">Order status</h2>{status.length === 0 ? <p className="text-sm text-gray-500 py-8 text-center">No orders in this period.</p> : <div className="h-80"><ResponsiveContainer width="100%" height="100%"><BarChart data={status}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="status" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="count" fill="currentColor" /></BarChart></ResponsiveContainer></div>}</div>
        </div>
        <div className="mt-6 bg-white rounded-xl border shadow-sm p-5"><h2 className="font-semibold text-gray-900 mb-4">Top selling items</h2>{topItems.length === 0 ? <p className="text-sm text-gray-500">No completed item sales in this period.</p> : <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="border-b text-left text-gray-500"><th className="py-3 pr-4">Item</th><th className="py-3 pr-4">Quantity</th><th className="py-3">Revenue</th></tr></thead><tbody>{topItems.map((item) => <tr key={item.listing_id} className="border-b last:border-0"><td className="py-3 pr-4 font-medium text-gray-900">{item.title}</td><td className="py-3 pr-4">{item.quantity}</td><td className="py-3">{money(item.revenue)}</td></tr>)}</tbody></table></div>}</div>
      </div>
    </div>
  );
}
