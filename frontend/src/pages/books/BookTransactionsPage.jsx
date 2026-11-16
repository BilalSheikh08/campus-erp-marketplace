/**
 * Campus Commons - Student Textbook Transactions
 * Academic Exchange Transaction Ledger:
 * Track student reservations, peer handoffs, and completed transactions.
 */

import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, XCircle, ArrowLeft } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { cancelBookTransaction, completeBookTransaction, fetchMyBookTransactions } from '../../services/booksApi';
import Alert from '../../components/shared/Alert';
import Button from '../../components/shared/Button';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const labels = {
  reserved: 'Peer Reserved',
  confirmed: 'Sale Confirmed',
  completed: 'Handover Completed',
  cancelled: 'Cancelled',
};

function resultsFrom(data) {
  return Array.isArray(data) ? data : data?.results || [];
}

export default function BookTransactionsPage() {
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setTransactions(resultsFrom(await fetchMyBookTransactions({ page_size: 50 })));
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not load transactions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const action = async (id, fn) => {
    setWorkingId(id);
    setError('');
    try {
      await fn(id);
      await load();
    } catch (err) {
      setError(err.response?.data?.detail || 'Transaction action failed.');
    } finally {
      setWorkingId(null);
    }
  };

  const participantLabel = (tx) => (tx.buyer === user?.id ? 'Your Role: Registered Buyer' : 'Your Role: Listed Seller');

  return (
    <div className="min-h-screen bg-[#F8F6F0] py-10 pb-24 text-zinc-900 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/books/my-listings"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-600 hover:text-zinc-950 transition mb-5"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> BACK TO MY LISTINGS
        </Link>

        <div className="mb-8 pb-5 border-b border-[#E4DDCF]">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-900 mb-1">
            PEER-TO-PEER EXCHANGE · TRANSACTION LEDGER
          </div>
          <h1 className="font-serif text-3xl font-normal text-zinc-950 tracking-tight">
            Book Transaction Records
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 mt-1 font-sans">
            Track student reservations, handoff receipts, and peer exchange ledger records.
          </p>
        </div>

        {error && (
          <div className="mb-6">
            <Alert type="error" message={error} dismissible onClose={() => setError('')} />
          </div>
        )}

        {loading ? (
          <LoadingSpinner message="Consulting transaction ledger..." />
        ) : transactions.length === 0 ? (
          <div className="bg-white rounded-lg border border-[#E4DDCF] p-10 text-center shadow-xs">
            <EmptyState
              icon={<Clock className="mx-auto h-8 w-8 text-zinc-400" />}
              title="No textbook transactions on record"
              message="Student reservations and completed textbook exchanges will appear here."
              action={
                <Link to="/books">
                  <Button variant="primary" size="sm" className="mt-2 text-xs">
                    Browse Textbook Catalog
                  </Button>
                </Link>
              }
            />
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="bg-white rounded-lg border border-[#E4DDCF] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold text-zinc-950">
                      TX #{tx.id.slice(0, 8).toUpperCase()}
                    </span>
                    <span
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                        tx.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : tx.status === 'confirmed'
                          ? 'bg-blue-50 text-blue-900 border-blue-300'
                          : tx.status === 'cancelled'
                          ? 'bg-red-50 text-red-800 border-red-300'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}
                    >
                      {labels[tx.status] || tx.status}
                    </span>
                  </div>

                  <p className="font-serif text-sm font-bold text-zinc-950">{tx.book_title || 'Curriculum Textbook'}</p>
                  <p className="text-xs font-mono text-zinc-500 mt-0.5">{participantLabel(tx)}</p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto font-sans">
                  {tx.status === 'confirmed' && tx.buyer === user?.id && (
                    <Button
                      size="sm"
                      variant="primary"
                      loading={workingId === tx.id}
                      onClick={() => action(tx.id, completeBookTransaction)}
                      className="text-xs font-semibold"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                      Mark Received
                    </Button>
                  )}

                  {tx.status !== 'completed' && tx.status !== 'cancelled' && (
                    <Button
                      size="sm"
                      variant="outline"
                      loading={workingId === tx.id}
                      onClick={() => action(tx.id, cancelBookTransaction)}
                      className="text-xs text-red-800 hover:bg-red-50 border-[#E4DDCF]"
                    >
                      <XCircle className="h-3.5 w-3.5 mr-1" />
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
