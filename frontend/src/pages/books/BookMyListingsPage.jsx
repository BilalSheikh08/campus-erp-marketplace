/**
 * Campus Commons - Student My Book Listings
 * Manage peer-to-peer textbook sales, confirm handoffs, and view status.
 */

import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Plus, CheckCircle, ExternalLink } from 'lucide-react';
import { confirmBookSale, fetchMyBookListings } from '../../services/booksApi';
import Alert from '../../components/shared/Alert';
import Button from '../../components/shared/Button';
import SafeImage from '../../components/shared/SafeImage';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';

function resultsFrom(data) {
  return Array.isArray(data) ? data : data?.results || [];
}

function label(value) {
  return value ? value.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '—';
}

export default function BookMyListingsPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchMyBookListings({ page_size: 50, available: 'all' });
      setBooks(resultsFrom(data));
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not load your book listings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const confirmSale = async (id) => {
    setWorkingId(id);
    setError('');
    try {
      await confirmBookSale(id);
      await load();
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not confirm the sale.');
    } finally {
      setWorkingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 pb-24 text-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Book Listings</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage textbook sales and confirm handoffs to student buyers.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/books/transactions">
              <Button variant="outline" size="sm">
                View Transactions
              </Button>
            </Link>
            <Link to="/books/new">
              <Button variant="blue" size="sm" className="gap-1.5 font-bold">
                <Plus className="h-4 w-4" /> New Book Listing
              </Button>
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6">
            <Alert type="error" message={error} dismissible onClose={() => setError('')} />
          </div>
        )}

        {loading ? (
          <LoadingSpinner message="Loading your listings..." />
        ) : books.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
            <EmptyState
              icon={<BookOpen className="mx-auto h-12 w-12 text-slate-300" />}
              title="No book listings yet"
              message="List course textbooks or competitive exam guides to hand down to fellow students."
              action={
                <Link to="/books/new">
                  <Button variant="blue" className="mt-4 font-bold">
                    List Your First Book
                  </Button>
                </Link>
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => {
              const isReserved = book.status === 'reserved' || (book.status === 'active' && !book.is_available);
              return (
                <div
                  key={book.id}
                  className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition"
                >
                  <div>
                    <div className="flex items-center gap-3.5 mb-4">
                      <div className="w-16 h-20 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                        <SafeImage
                          src={book.image_url}
                          alt={book.title}
                          domain="book"
                          category="book"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span
                          className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border inline-block mb-1 ${
                            book.status === 'active' && book.is_available
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : isReserved
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {label(book.status)}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 truncate">{book.title}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {book.author ? `by ${book.author}` : 'Author unspecified'}
                        </p>
                        <p className="text-sm font-mono font-extrabold text-slate-900 mt-1">
                          ₹{Number(book.price || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Link
                      to={`/books/${book.id}`}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      View Listing
                    </Link>

                    {isReserved && (
                      <Button
                        size="sm"
                        variant="blue"
                        loading={workingId === book.id}
                        disabled={workingId === book.id}
                        onClick={() => confirmSale(book.id)}
                        className="text-xs font-bold"
                      >
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                        Confirm Handover
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
