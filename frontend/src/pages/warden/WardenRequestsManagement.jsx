/**
 * Campus Commons - Warden Requisitions Queue
 * Residence Hall Superintendent Requisitions Ledger:
 * Status tabs, resident room search, quick approval / rejection actions.
 */

import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Package,
  Search,
  Eye,
  Check,
  X,
  Building2,
  ArrowLeft,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { fetchWardenHostelRequests, transitionHostelRequest } from '../../services/hostelRequestsApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/shared/Button';

const STATUS_BADGES = {
  submitted: { label: 'Submitted', color: 'bg-[#FAF8F3] text-zinc-700 border-[#E4DDCF]' },
  pending_approval: { label: 'Pending Approval', color: 'bg-amber-50 text-amber-900 border-amber-300' },
  approved: { label: 'Approved', color: 'bg-emerald-50 text-emerald-900 border-emerald-300' },
  rejected: { label: 'Declined', color: 'bg-rose-50 text-rose-900 border-rose-300' },
  fulfilled: { label: 'Fulfilled & Issued', color: 'bg-blue-50 text-blue-900 border-blue-300' },
  cancelled: { label: 'Cancelled', color: 'bg-[#FAF8F3] text-zinc-500 border-[#E4DDCF]' },
};

export default function WardenRequestsManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'all';

  const [requests, setRequests] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [transitionLoading, setTransitionLoading] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    let result = requests;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (r) =>
          (r.listing_title || '').toLowerCase().includes(term) ||
          (r.student_name || '').toLowerCase().includes(term) ||
          (r.room_number || '').toLowerCase().includes(term) ||
          r.id.toLowerCase().includes(term)
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter((r) => r.status === statusFilter);
    }
    setFiltered(result);
  }, [requests, searchTerm, statusFilter]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await fetchWardenHostelRequests({ page_size: 200 });
      const reqs = Array.isArray(data) ? data : data.results || [];
      setRequests(reqs);
    } catch (err) {
      console.error('Failed to load requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTransition = async (requestId, action) => {
    try {
      setTransitionLoading(true);
      await transitionHostelRequest(requestId, action, '');
      await loadRequests();
    } catch (err) {
      alert(err.response?.data?.detail || 'Transition failed');
    } finally {
      setTransitionLoading(false);
    }
  };

  const getAllowedActions = (status) => {
    const actions = [];
    if (status === 'pending_approval') {
      actions.push({ action: 'approved', label: 'Approve', icon: Check, color: 'bg-emerald-800 hover:bg-emerald-900 text-white' });
      actions.push({ action: 'rejected', label: 'Decline', icon: X, color: 'bg-rose-800 hover:bg-rose-900 text-white' });
    }
    if (status === 'approved') {
      actions.push({ action: 'fulfilled', label: 'Issue Item', icon: Package, color: 'bg-blue-900 hover:bg-blue-950 text-white' });
    }
    return actions;
  };

  if (loading) {
    return <LoadingSpinner message="Consulting residence hall requisition queue..." />;
  }

  const tabs = [
    { id: 'all', label: 'All Requisitions', count: requests.length },
    { id: 'pending_approval', label: 'Pending Review', count: requests.filter((r) => ['submitted', 'pending_approval'].includes(r.status)).length },
    { id: 'approved', label: 'Approved for Issue', count: requests.filter((r) => r.status === 'approved').length },
    { id: 'fulfilled', label: 'Issued to Room', count: requests.filter((r) => r.status === 'fulfilled').length },
    { id: 'rejected', label: 'Declined', count: requests.filter((r) => r.status === 'rejected').length },
  ];

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-zinc-900 py-10 pb-24 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Masthead */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-5 border-b border-[#E4DDCF]">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
              <Building2 className="h-3.5 w-3.5 text-zinc-700" />
              <span>SUPERINTENDENT OFFICE · RESIDENTIAL REQUISITION QUEUE</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-zinc-950 tracking-tight">
              Hostel Requisitions Queue
            </h1>
            <p className="text-zinc-600 text-xs sm:text-sm mt-1 font-sans">
              Audit room supplies, verify resident eligibility, and issue official superintendent approvals.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link to="/warden/dashboard">
              <Button variant="outline" size="sm" className="text-xs flex items-center gap-1.5">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Superintendent Desk</span>
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={loadRequests}
              className="text-xs p-2"
              title="Refresh ledger"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none font-mono">
          {tabs.map((tab) => {
            const active = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setStatusFilter(tab.id);
                  setSearchParams(tab.id === 'all' ? {} : { status: tab.id });
                }}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-colors shrink-0 cursor-pointer ${
                  active
                    ? 'bg-zinc-900 text-white font-semibold'
                    : 'bg-white text-zinc-700 hover:bg-[#FAF8F3] border border-[#E4DDCF]'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                    active ? 'bg-zinc-800 text-zinc-200' : 'bg-[#FAF8F3] text-zinc-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg p-3.5 border border-[#E4DDCF] shadow-xs mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by student name, room number, or item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full text-xs font-sans border border-[#E4DDCF] bg-[#FAF8F3] rounded text-zinc-900 focus:outline-none focus:border-blue-900 focus:bg-white placeholder:text-zinc-400"
            />
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 shrink-0 self-center">
            <Filter className="h-3.5 w-3.5 text-zinc-400" />
            <span>Showing <strong className="text-zinc-900">{filtered.length}</strong> requisition{filtered.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Requisitions Table */}
        <div className="bg-white rounded-lg border border-[#E4DDCF] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F3] border-b border-[#E4DDCF] text-zinc-500 font-mono text-[10px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Requisition Docket</th>
                  <th className="px-5 py-3.5">Resident Student</th>
                  <th className="px-5 py-3.5">Room Assignment</th>
                  <th className="px-5 py-3.5">Equipment &amp; Volume</th>
                  <th className="px-5 py-3.5">Decision Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4DDCF]">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-14 text-center text-zinc-400">
                      <Package className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
                      <div className="text-sm font-serif font-bold text-zinc-800">No requisitions located</div>
                      <p className="text-xs text-zinc-500 mt-0.5 font-sans">
                        No student requests match the active filter criteria.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((req) => {
                    const badge = STATUS_BADGES[req.status] || {
                      label: req.status_display || req.status,
                      color: 'bg-[#FAF8F3] text-zinc-700 border-[#E4DDCF]',
                    };

                    return (
                      <tr key={req.id} className="hover:bg-[#FAF8F3]/60 transition-colors">
                        <td className="px-5 py-3.5">
                          <Link
                            to={`/warden/requests/${req.id}`}
                            className="font-mono text-xs font-bold text-zinc-950 hover:text-blue-900 transition-colors"
                          >
                            #{req.id.slice(0, 8).toUpperCase()}
                          </Link>
                          <span className="text-[10px] font-mono text-zinc-400 block mt-0.5">
                            {req.created_at ? new Date(req.created_at).toLocaleDateString() : ''}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="font-serif font-bold text-zinc-950 text-sm">
                            {req.student_name || 'Resident Student'}
                          </div>
                          <div className="text-[10px] font-mono text-zinc-500 mt-0.5">
                            {req.student_email || '—'}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="font-mono font-semibold text-zinc-800">
                            Room {req.room_number || 'N/A'}
                          </div>
                          <div className="text-[10px] font-mono text-zinc-500">
                            Hall Block {req.hostel_block || 'A'}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="font-medium text-zinc-950 text-xs">
                            {req.listing_title || 'Hostel Supply Item'}
                          </div>
                          <div className="text-[10px] font-mono text-zinc-500 mt-0.5">
                            Allocated: <span className="font-semibold text-zinc-800">{req.quantity || 1} unit(s)</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${badge.color}`}
                          >
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              to={`/warden/requests/${req.id}`}
                              className="p-1.5 text-zinc-500 hover:text-zinc-950 hover:bg-[#FAF8F3] rounded border border-[#E4DDCF] transition-colors"
                              title="Inspect Dossier"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Link>
                            {getAllowedActions(req.status).map((actionDef) => {
                              const ActionIcon = actionDef.icon;
                              return (
                                <button
                                  key={actionDef.action}
                                  onClick={() => handleTransition(req.id, actionDef.action)}
                                  disabled={transitionLoading}
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono font-bold shadow-xs transition-all ${actionDef.color} disabled:opacity-50 cursor-pointer`}
                                >
                                  <ActionIcon className="h-3 w-3" />
                                  <span>{actionDef.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
