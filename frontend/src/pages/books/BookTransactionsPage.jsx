/**
 * Campus Commons - Student Textbook Transactions
 * Track peer book reservations, cancellations, and completed exchanges.
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
  reserved: 'Reserved',
  confirmed: 'Sale Confirmed',
  completed: 'Completed',
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

  const participantLabel = (tx) => (tx.buyer === user?.id ? 'You are the buyer' : 'You are the seller');

  return (
    <div className="min-h-screen bg-slate-50 py-10 pb-24 text-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/books/my-listings"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to My Book Listings
        </Link>

        <div className="mb-8 pb-6 border-b border-slate-200">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Book Transactions</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track student reservations, handoffs, and peer exchange ledger records.
          </p>
        </div>

        {error && (
          <div className="mb-6">
            <Alert type="error" message={error} dismissible onClose={() => setError('')} />
          </div>
        )}

        {loading ? (
          <LoadingSpinner message="Loading transactions..." />
        ) : transactions.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
            <EmptyState
              icon={<Clock className="mx-auto h-12 w-12 text-slate-300" />}
              title="No book transactions"
              message="Student reservations and completed textbook exchanges will appear here."
              action={
                <Link to="/books">
                  <Button variant="blue" className="mt-4 font-bold">
                    Browse Books
                  </Button>
                </Link>
              }
            />
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      TX #{tx.id.slice(0, 8).toUpperCase()}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                        tx.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : tx.status === 'confirmed'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : tx.status === 'cancelled'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {labels[tx.status] || tx.status}
                    </span>
                  </div>

                  <p className="text-sm font-bold text-slate-900">{tx.book_title || 'Curriculum Textbook'}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{participantLabel(tx)}</p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {tx.status === 'confirmed' && tx.buyer === user?.id && (
                    <Button
                      size="sm"
                      variant="blue"
                      loading={workingId === tx.id}
                      onClick={() => action(tx.id, completeBookTransaction)}
                      className="font-bold text-xs"
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
                      className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-slate-200"
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
