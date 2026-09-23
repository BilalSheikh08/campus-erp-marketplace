import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { cancelBookTransaction, completeBookTransaction, fetchMyBookTransactions } from '../../services/booksApi';
import Alert from '../../components/shared/Alert';
import Button from '../../components/shared/Button';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const labels = { reserved: 'Reserved', confirmed: 'Sale confirmed', completed: 'Completed', cancelled: 'Cancelled' };
function resultsFrom(data) { return Array.isArray(data) ? data : data?.results || []; }

export default function BookTransactionsPage() {
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { setTransactions(resultsFrom(await fetchMyBookTransactions({ page_size: 50 }))); }
    catch (err) { setError(err.response?.data?.detail || 'Could not load transactions.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const action = async (id, fn) => {
    setWorkingId(id); setError('');
    try { await fn(id); await load(); } catch (err) { setError(err.response?.data?.detail || 'Transaction action failed.'); }
    finally { setWorkingId(null); }
  };

  const participantLabel = (tx) => tx.buyer === user?.id ? 'You are the buyer' : 'You are the seller';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8"><h1 className="text-3xl font-bold text-gray-900">Book Transactions</h1><p className="text-gray-600 mt-1">Track reservations, sale confirmations, and completed handoffs.</p></div>
        {error && <div className="mb-6"><Alert type="error" message={error} dismissible onClose={() => setError('')} /></div>}
        {loading ? <LoadingSpinner message="Loading transactions..." /> : transactions.length === 0 ? <div className="bg-white rounded-xl border"><EmptyState icon={<Clock className="mx-auto h-12 w-12" />} title="No book transactions" message="Reservations and completed book sales will appear here." /></div> : (
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div key={tx.id} className="bg-white rounded-xl border shadow-sm p-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  <div><div className="flex items-center gap-2"><h2 className="font-semibold text-gray-900">{tx.listing_title}</h2><span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">{labels[tx.status] || tx.status}</span></div><p className="text-sm text-gray-500 mt-2">₹{Number(tx.price || 0).toFixed(2)} · {participantLabel(tx)}</p><p className="text-xs text-gray-400 mt-1">Transaction ID: {tx.id}</p></div>
                  <div className="flex flex-wrap gap-2">{tx.status === 'reserved' && <Button variant="danger" size="sm" loading={workingId === tx.id} onClick={() => action(tx.id, cancelBookTransaction)}><XCircle className="h-4 w-4 mr-1" /> Cancel</Button>}{tx.status === 'confirmed' && <Button size="sm" loading={workingId === tx.id} onClick={() => action(tx.id, completeBookTransaction)}><CheckCircle2 className="h-4 w-4 mr-1" /> Mark completed</Button>}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
