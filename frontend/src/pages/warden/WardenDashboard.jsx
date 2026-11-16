import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Clock,
  ClipboardList,
  CheckCircle2,
  Building,
  ArrowRight,
  ShieldAlert,
  Home,
  Check,
  Eye,
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/shared/Button';
import { fetchWardenHostelRequests } from '../../services/hostelRequestsApi';

const STATUS_BADGES = {
  submitted: { label: 'Submitted', style: 'bg-slate-100 text-slate-700 border-slate-200' },
  pending_approval: { label: 'Pending Review', style: 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse' },
  approved: { label: 'Approved', style: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  fulfilled: { label: 'Issued to Resident', style: 'bg-blue-50 text-blue-700 border-blue-200' },
  rejected: { label: 'Declined', style: 'bg-rose-50 text-rose-700 border-rose-200' },
  cancelled: { label: 'Cancelled', style: 'bg-slate-100 text-slate-500 border-slate-200' },
};

export default function WardenDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    fulfilled: 0,
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchWardenHostelRequests({ page_size: 100 });
        const requests = Array.isArray(data) ? data : data.results || [];

        setStats({
          total: requests.length,
          pending: requests.filter((r) => ['submitted', 'pending_approval'].includes(r.status)).length,
          approved: requests.filter((r) => r.status === 'approved').length,
          rejected: requests.filter((r) => r.status === 'rejected').length,
          fulfilled: requests.filter((r) => r.status === 'fulfilled').length,
        });
        setRecentRequests(requests.slice(0, 8));
      } catch (err) {
        console.error('Failed to load warden dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Opening Warden Administration Desk..." />;
  }

  const statCards = [
    {
      label: 'Total Requisitions',
      value: stats.total,
      sub: 'All student submissions',
      icon: ClipboardList,
      color: 'text-slate-900',
      bg: 'bg-slate-50',
    },
    {
      label: 'Pending Approvals',
      value: stats.pending,
      sub: 'Awaiting warden action',
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Approved for Issue',
      value: stats.approved,
      sub: 'Ready for resident collection',
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Fulfilled & Issued',
      value: stats.fulfilled,
      sub: 'Stock reconciled in rooms',
      icon: Package,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Top Banner */}
      <section className="bg-slate-900 text-white border-b border-slate-800 pt-10 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-emerald-400 border border-slate-700 text-xs font-medium mb-3">
                <Building className="h-3.5 w-3.5" />
                <span>Hostel Residence Authority</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Warden Operations Desk
              </h1>
              <p className="text-slate-400 text-sm mt-1 max-w-2xl">
                Review room equipment requisitions, manage mattress & lamp distribution, and authorize student move-in supplies.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/warden/requests">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-2">
                  <ClipboardList className="h-4 w-4" />
                  <span>Manage All Requests</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{card.label}</span>
                  <div className={`p-2 rounded-lg ${card.bg}`}>
                    <Icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                </div>
                <div className="text-3xl font-black text-slate-900 mt-2">{card.value}</div>
                <p className="text-xs text-slate-500 mt-1">{card.sub}</p>
              </div>
            );
          })}
        </div>

        {/* Action Shortcuts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            to="/warden/requests?status=pending_approval"
            className="p-5 rounded-xl bg-white border border-slate-200/80 hover:border-amber-300 shadow-sm transition-all group flex items-start gap-4"
          >
            <div className="p-3 rounded-lg bg-amber-50 text-amber-600 group-hover:scale-105 transition-transform">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                Pending Approval Queue
                <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {stats.pending} request{stats.pending !== 1 ? 's' : ''} currently awaiting warden verification and stock approval.
              </p>
            </div>
          </Link>

          <Link
            to="/warden/requests?status=approved"
            className="p-5 rounded-xl bg-white border border-slate-200/80 hover:border-emerald-300 shadow-sm transition-all group flex items-start gap-4"
          >
            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform">
              <Check className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                Approved for Distribution
                <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {stats.approved} approved request{stats.approved !== 1 ? 's' : ''} ready for room keys & inventory dispatch.
              </p>
            </div>
          </Link>

          <Link
            to="/marketplace?category=hostel_supply"
            className="p-5 rounded-xl bg-white border border-slate-200/80 hover:border-blue-300 shadow-sm transition-all group flex items-start gap-4"
          >
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600 group-hover:scale-105 transition-transform">
              <Home className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                Hostel Supply Catalog
                <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Inspect available room accessories, bedding, desk chairs, and allocated quotas.
              </p>
            </div>
          </Link>
        </div>

        {/* Recent Requisitions Table */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Student Requisitions</h2>
              <p className="text-xs text-slate-500 mt-0.5">Real-time room supply intake across all hostel blocks</p>
            </div>
            <Link
              to="/warden/requests"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View all requests <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recentRequests.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <ClipboardList className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">No student requisitions yet</h3>
              <p className="text-xs text-slate-500 mt-1">
                Student hostel supply requests will appear here once submitted.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4 sm:px-6">Requisition</th>
                    <th className="py-3 px-4">Student & Room</th>
                    <th className="py-3 px-4">Supply Item</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 sm:px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentRequests.map((req) => {
                    const badge = STATUS_BADGES[req.status] || {
                      label: req.status_display || req.status,
                      style: 'bg-slate-100 text-slate-700 border-slate-200',
                    };
                    const dateFormatted = req.created_at
                      ? new Date(req.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })
                      : '';

                    return (
                      <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 sm:px-6">
                          <span className="font-mono text-xs font-bold text-slate-900">
                            #{req.id.slice(0, 8).toUpperCase()}
                          </span>
                          <span className="text-xs text-slate-400 block mt-0.5">{dateFormatted}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900 text-xs sm:text-sm">
                            {req.student_name || 'Resident Student'}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <Building className="h-3 w-3 text-slate-400" />
                            <span>Room {req.room_number || 'N/A'}, Block {req.hostel_block || 'A'}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-900 text-xs sm:text-sm">
                            {req.listing_title || 'Hostel Supply'}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            Qty: <span className="font-semibold text-slate-700">{req.quantity || 1}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.style}`}
                          >
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 sm:px-6 text-right">
                          <Link to={`/warden/requests/${req.id}`}>
                            <Button variant="outline" size="sm" className="text-xs py-1 px-3 border-slate-300 hover:border-blue-600 hover:text-blue-600">
                              <Eye className="h-3.5 w-3.5 mr-1" />
                              Inspect
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
