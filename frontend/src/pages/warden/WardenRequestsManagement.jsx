import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Package,
  Search,
  Eye,
  Check,
  X,
  Building2,
  ArrowLeft,
  Filter,
} from 'lucide-react';
import { fetchWardenHostelRequests, transitionHostelRequest } from '../../services/hostelRequestsApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const STATUS_BADGES = {
  submitted: { label: 'Submitted', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  pending_approval: { label: 'Pending Approval', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  approved: { label: 'Approved', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  rejected: { label: 'Declined', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  fulfilled: { label: 'Fulfilled & Issued', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  cancelled: { label: 'Cancelled', color: 'bg-slate-100 text-slate-500 border-slate-200' },
};

export default function WardenRequestsManagement() {
  const navigate = useNavigate();
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
      actions.push({ action: 'approved', label: 'Approve', icon: Check, color: 'bg-emerald-600 hover:bg-emerald-700 text-white' });
      actions.push({ action: 'rejected', label: 'Decline', icon: X, color: 'bg-rose-600 hover:bg-rose-700 text-white' });
    }
    if (status === 'approved') {
      actions.push({ action: 'fulfilled', label: 'Issue Item', icon: Package, color: 'bg-blue-600 hover:bg-blue-700 text-white' });
    }
    return actions;
  };

  if (loading) {
    return <LoadingSpinner message="Loading residence requisitions queue..." />;
  }

  const tabs = [
    { id: 'all', label: 'All Requisitions', count: requests.length },
    { id: 'pending_approval', label: 'Pending Approval', count: requests.filter((r) => ['submitted', 'pending_approval'].includes(r.status)).length },
    { id: 'approved', label: 'Approved', count: requests.filter((r) => r.status === 'approved').length },
    { id: 'fulfilled', label: 'Fulfilled', count: requests.filter((r) => r.status === 'fulfilled').length },
    { id: 'rejected', label: 'Declined', count: requests.filter((r) => r.status === 'rejected').length },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-8 pb-20 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate('/warden/dashboard')}
          className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Warden Desk
        </button>

        {/* Page Title */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Building2 className="h-7 w-7 text-blue-600" />
              <span>Hostel Requisitions Queue</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Audit and verify student requests for room accessories, bedding, and institutional assets.
            </p>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          {tabs.map((tab) => {
            const active = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setStatusFilter(tab.id);
                  setSearchParams(tab.id === 'all' ? {} : { status: tab.id });
                }}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                  active
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    active ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by student name, room number, or item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full text-xs sm:text-sm border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 placeholder:text-slate-400"
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 shrink-0 self-center">
            <Filter className="h-4 w-4 text-slate-400" />
            <span>Showing <strong className="text-slate-900">{filtered.length}</strong> requisition{filtered.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Requisition</th>
                  <th className="px-4 py-3.5">Student / Resident</th>
                  <th className="px-4 py-3.5">Item & Qty</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center text-slate-400">
                      <Package className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                      <div className="text-sm font-semibold text-slate-700">No requisitions found</div>
                      <p className="text-xs text-slate-400 mt-0.5">Try adjusting your search terms or filter selection.</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((req) => {
                    const badge = STATUS_BADGES[req.status] || {
                      label: req.status_display || req.status,
                      color: 'bg-slate-100 text-slate-700 border-slate-200',
                    };

                    return (
                      <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-3.5">
                          <Link
                            to={`/warden/requests/${req.id}`}
                            className="font-mono text-xs font-bold text-slate-900 hover:text-blue-600 transition-colors"
                          >
                            #{req.id.slice(0, 8).toUpperCase()}
                          </Link>
                          <span className="text-xs text-slate-400 block mt-0.5">
                            {req.created_at ? new Date(req.created_at).toLocaleDateString() : ''}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-slate-900 text-xs sm:text-sm">
                            {req.student_name || 'Resident Student'}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            Room {req.room_number || 'N/A'}, Block {req.hostel_block || 'A'}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-medium text-slate-900 text-xs sm:text-sm">
                            {req.listing_title || 'Hostel Supply Item'}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            Quantity: <span className="font-semibold text-slate-700">{req.quantity || 1}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.color}`}
                          >
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              to={`/warden/requests/${req.id}`}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Inspect Requisition Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            {getAllowedActions(req.status).map((actionDef) => {
                              const ActionIcon = actionDef.icon;
                              return (
                                <button
                                  key={actionDef.action}
                                  onClick={() => handleTransition(req.id, actionDef.action)}
                                  disabled={transitionLoading}
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold shadow-sm transition-all ${actionDef.color} disabled:opacity-50`}
                                >
                                  <ActionIcon className="h-3.5 w-3.5" />
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
