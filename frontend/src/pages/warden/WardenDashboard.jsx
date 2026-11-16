/**
 * Campus Commons - Warden Operations Desk
 * Residence Hall Superintendent Office & Requisitions Ledger:
 * Room equipment requests, student allocations, and superintendent approval stamps.
 */

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
  RefreshCw,
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/shared/Button';
import { fetchWardenHostelRequests } from '../../services/hostelRequestsApi';

const STATUS_BADGES = {
  submitted: { label: 'Submitted', style: 'bg-[#FAF8F3] text-zinc-700 border-[#E4DDCF]' },
  pending_approval: { label: 'Pending Review', style: 'bg-amber-50 text-amber-900 border-amber-300' },
  approved: { label: 'Approved for Issue', style: 'bg-emerald-50 text-emerald-900 border-emerald-300' },
  fulfilled: { label: 'Issued to Room', style: 'bg-blue-50 text-blue-900 border-blue-300' },
  rejected: { label: 'Declined', style: 'bg-rose-50 text-rose-900 border-rose-300' },
  cancelled: { label: 'Cancelled', style: 'bg-[#FAF8F3] text-zinc-500 border-[#E4DDCF]' },
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

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Opening Superintendent Requisitions Desk..." />;
  }

  const statCards = [
    {
      label: 'Total Requisitions',
      value: stats.total,
      sub: 'All registered room claims',
      icon: ClipboardList,
    },
    {
      label: 'Pending Warden Decision',
      value: stats.pending,
      sub: 'Awaiting superintendent stamp',
      icon: Clock,
      highlight: stats.pending > 0,
    },
    {
      label: 'Approved for Issue',
      value: stats.approved,
      sub: 'Awaiting student collection',
      icon: CheckCircle2,
    },
    {
      label: 'Fulfilled & Issued',
      value: stats.fulfilled,
      sub: 'Reconciled in hall registry',
      icon: Package,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-zinc-900 py-10 pb-24 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Masthead */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-5 border-b border-[#E4DDCF]">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
              <Building className="h-3.5 w-3.5 text-zinc-700" />
              <span>SUPERINTENDENT OFFICE · RESIDENCE HALL REQUISITIONS DESK</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-zinc-950 tracking-tight">
              Warden Operations Desk
            </h1>
            <p className="text-zinc-600 text-xs sm:text-sm mt-1 font-sans">
              Review room equipment requisitions, authorize mattress &amp; lamp allocations, and issue resident inventory.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              className="text-xs p-2"
              title="Refresh ledger"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
            <Link to="/warden/requests">
              <Button variant="primary" size="sm" className="text-xs flex items-center gap-1.5 font-bold">
                <ClipboardList className="h-3.5 w-3.5" />
                <span>All Requisitions Queue</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* 4 Core Metric Slips */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className={`bg-white rounded-lg p-5 border shadow-xs ${
                  card.highlight ? 'border-amber-400 bg-amber-50/20' : 'border-[#E4DDCF]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                    {card.label}
                  </span>
                  <div className="w-8 h-8 rounded bg-[#FAF8F3] border border-[#E4DDCF] flex items-center justify-center text-zinc-700">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-3xl font-mono font-bold text-zinc-950 mt-2">
                  {card.value}
                </div>
                <p className="text-[11px] font-mono text-zinc-500 mt-1">{card.sub}</p>
              </div>
            );
          })}
        </div>

        {/* Fast Action Shortcuts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            to="/warden/requests?status=pending_approval"
            className="p-5 rounded-lg bg-white border border-[#E4DDCF] hover:border-amber-400 shadow-xs transition-colors group flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center shrink-0">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm text-zinc-950 group-hover:text-blue-900 transition-colors flex items-center gap-1">
                Pending Decisions Queue
                <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-xs text-zinc-600 mt-1 leading-relaxed font-sans">
                {stats.pending} requisition{stats.pending !== 1 ? 's' : ''} currently awaiting superintendent verification and room allocation.
              </p>
            </div>
          </Link>

          <Link
            to="/warden/requests?status=approved"
            className="p-5 rounded-lg bg-white border border-[#E4DDCF] hover:border-emerald-400 shadow-xs transition-colors group flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center shrink-0">
              <Check className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm text-zinc-950 group-hover:text-blue-900 transition-colors flex items-center gap-1">
                Approved for Room Issue
                <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-xs text-zinc-600 mt-1 leading-relaxed font-sans">
                {stats.approved} approved docket{stats.approved !== 1 ? 's' : ''} authorized for resident physical collection.
              </p>
            </div>
          </Link>

          <Link
            to="/marketplace/hostel_supply"
            className="p-5 rounded-lg bg-white border border-[#E4DDCF] hover:border-blue-400 shadow-xs transition-colors group flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded bg-[#FAF8F3] border border-[#E4DDCF] text-zinc-800 flex items-center justify-center shrink-0">
              <Home className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm text-zinc-950 group-hover:text-blue-900 transition-colors flex items-center gap-1">
                Hostel Supply Directory
                <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-xs text-zinc-600 mt-1 leading-relaxed font-sans">
                Inspect public catalog specifications, bedding, desk lamps, and approved allocation terms.
              </p>
            </div>
          </Link>
        </div>

        {/* Recent Requisitions Ledger Table */}
        <div className="bg-white rounded-lg border border-[#E4DDCF] shadow-xs overflow-hidden">
          <div className="p-5 border-b border-[#E4DDCF] flex items-center justify-between">
            <div>
              <h2 className="font-serif font-bold text-base text-zinc-950">Recent Residence Requisitions</h2>
              <p className="text-[11px] font-mono text-zinc-500 mt-0.5">Real-time room supply intake across all residential halls</p>
            </div>
            <Link
              to="/warden/requests"
              className="text-xs font-mono font-semibold text-blue-900 hover:underline flex items-center gap-1"
            >
              <span>View All Requisitions</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {recentRequests.length === 0 ? (
            <div className="p-12 text-center max-w-sm mx-auto">
              <ClipboardList className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
              <h3 className="font-serif font-bold text-sm text-zinc-900">No student requisitions recorded</h3>
              <p className="text-xs text-zinc-500 mt-1 font-sans">
                Resident submissions will be logged here as soon as they submit requests.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F3] border-b border-[#E4DDCF] text-zinc-500 font-mono text-[10px] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-5">Requisition Docket</th>
                    <th className="py-3 px-5">Student &amp; Room Assignment</th>
                    <th className="py-3 px-5">Requested Equipment</th>
                    <th className="py-3 px-5">Warden Decision</th>
                    <th className="py-3 px-5 text-right">Inspection Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4DDCF]">
                  {recentRequests.map((req) => {
                    const badge = STATUS_BADGES[req.status] || {
                      label: req.status_display || req.status,
                      style: 'bg-[#FAF8F3] text-zinc-700 border-[#E4DDCF]',
                    };
                    const dateFormatted = req.created_at
                      ? new Date(req.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })
                      : '';

                    return (
                      <tr key={req.id} className="hover:bg-[#FAF8F3]/60 transition-colors">
                        <td className="py-3.5 px-5">
                          <span className="font-mono text-xs font-bold text-zinc-950">
                            #{req.id.slice(0, 8).toUpperCase()}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-400 block mt-0.5">{dateFormatted}</span>
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="font-serif font-bold text-zinc-950 text-sm">
                            {req.student_name || 'Resident Student'}
                          </div>
                          <div className="text-[11px] font-mono text-zinc-500 flex items-center gap-1.5 mt-0.5">
                            <Building className="h-3 w-3 text-zinc-400" />
                            <span>Room {req.room_number || 'N/A'}, Hall {req.hostel_block || 'A'}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="font-medium text-zinc-950 text-xs">
                            {req.listing_title || 'Hostel Supply'}
                          </div>
                          <div className="text-[11px] font-mono text-zinc-500 mt-0.5">
                            Allocated Qty: <span className="font-semibold text-zinc-800">{req.quantity || 1}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${badge.style}`}
                          >
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <Link to={`/warden/requests/${req.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs py-1 px-2.5 text-zinc-800 flex items-center gap-1 ml-auto"
                            >
                              <Eye className="h-3.5 w-3.5 text-zinc-600" />
                              <span>Inspect Dossier</span>
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
