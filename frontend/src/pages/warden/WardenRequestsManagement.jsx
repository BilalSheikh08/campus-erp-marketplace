import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Search,
  Eye,
  Check,
  X,
} from 'lucide-react';
import { fetchWardenHostelRequests, transitionHostelRequest, fetchWardenHostelRequest } from '../../services/hostelRequestsApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function WardenRequestsManagement() {
  const [requests, setRequests] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [transitionNotes, setTransitionNotes] = useState('');
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
      await transitionHostelRequest(requestId, action, transitionNotes);
      await loadRequests();
      if (selectedRequest && selectedRequest.id === requestId) {
        const updated = await fetchWardenHostelRequest(requestId);
        setSelectedRequest(updated);
      }
      setTransitionNotes('');
    } catch (err) {
      alert(err.response?.data?.detail || 'Transition failed');
    } finally {
      setTransitionLoading(false);
    }
  };

  const getAllowedActions = (status) => {
    const actions = [];
    if (status === 'pending_approval') {
      actions.push({ action: 'approved', label: 'Approve', icon: Check, color: 'bg-green-600 hover:bg-green-700' });
      actions.push({ action: 'rejected', label: 'Reject', icon: X, color: 'bg-red-600 hover:bg-red-700' });
    }
    if (status === 'approved') {
      actions.push({ action: 'fulfilled', label: 'Mark Fulfilled', icon: Package, color: 'bg-purple-600 hover:bg-purple-700' });
    }
    return actions;
  };

  const statusConfig = {
    submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-800' },
    pending_approval: { label: 'Pending Approval', color: 'bg-yellow-100 text-yellow-800' },
    approved: { label: 'Approved', color: 'bg-green-100 text-green-800' },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
    fulfilled: { label: 'Fulfilled', color: 'bg-purple-100 text-purple-800' },
    cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-800' },
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Hostel Requests</h1>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by student, listing, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Statuses</option>
          <option value="submitted">Submitted</option>
          <option value="pending_approval">Pending Approval</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="fulfilled">Fulfilled</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Request</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No requests found
                  </td>
                </tr>
              ) : (
                filtered.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        to={`/warden/requests/${request.id}`}
                        className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        {request.listing_title || 'Hostel Request'}
                      </Link>
                      <p className="text-xs text-gray-400">{request.id}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{request.student_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{request.quantity}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[request.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                        {statusConfig[request.status]?.label || request.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link
                          to={`/warden/requests/${request.id}`}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </Link>
                        {getAllowedActions(request.status).map((actionDef) => {
                          const ActionIcon = actionDef.icon;
                          return (
                            <button
                              key={actionDef.action}
                              onClick={() => handleTransition(request.id, actionDef.action)}
                              disabled={transitionLoading}
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-white transition ${actionDef.color} disabled:opacity-50`}
                            >
                              <ActionIcon size={14} />
                              {actionDef.label}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
