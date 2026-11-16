/**
 * Campus Commons - Student My Book Listings
 * Academic Exchange Management Ledger:
 * Manage textbook listings, confirm student handoffs, and review sales status.
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
    <div className="min-h-screen bg-[#F8F6F0] py-10 pb-24 text-zinc-900 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-5 border-b border-[#E4DDCF]">
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-900 mb-1">
              STUDENT DESK · SELLER DASHBOARD
            </div>
            <h1 className="font-serif text-3xl font-normal text-zinc-950 tracking-tight">
              My Textbook Listings
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 mt-1 font-sans">
              Manage listed textbooks, review student reserve requests, and confirm physical campus handoffs.
            </p>
          </div>
          <div className="flex items-center gap-2.5 font-sans">
            <Link to="/books/transactions">
              <Button variant="outline" size="sm" className="text-xs">
                Transaction History
              </Button>
            </Link>
            <Link to="/books/new">
              <Button variant="primary" size="sm" className="gap-1.5 text-xs font-semibold">
                <Plus className="h-3.5 w-3.5" /> New Textbook Listing
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
          <LoadingSpinner message="Consulting seller catalog..." />
        ) : books.length === 0 ? (
          <div className="bg-white rounded-lg border border-[#E4DDCF] p-10 text-center shadow-xs">
            <EmptyState
              icon={<BookOpen className="mx-auto h-8 w-8 text-zinc-400" />}
              title="No textbook listings on record"
              message="List course textbooks or competitive exam guides to hand down to fellow students."
              action={
                <Link to="/books/new">
                  <Button variant="primary" size="sm" className="mt-2 text-xs">
                    List Your First Textbook
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
                  className="bg-white rounded-lg border border-[#E4DDCF] p-5 flex flex-col justify-between shadow-xs hover:border-zinc-400 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-3.5 mb-4">
                      <div className="w-16 h-20 rounded bg-[#FAF8F3] overflow-hidden border border-[#E4DDCF] shrink-0">
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
                          className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border inline-block mb-1 ${
                            book.status === 'active' && book.is_available
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : isReserved
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-[#FAF8F3] text-zinc-600 border-[#E4DDCF]'
                          }`}
                        >
                          {label(book.status)}
                        </span>
                        <h3 className="font-serif text-sm font-bold text-zinc-950 truncate">{book.title}</h3>
                        <p className="text-xs font-mono text-zinc-500 mt-0.5">
                          {book.author ? `by ${book.author}` : 'Author unspecified'}
                        </p>
                        <p className="text-sm font-mono font-bold text-zinc-950 mt-1">
                          ₹{Number(book.price || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#E4DDCF] flex items-center justify-between gap-2">
                    <Link
                      to={`/books/${book.id}`}
                      className="text-xs font-mono text-blue-900 hover:underline inline-flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View Folio
                    </Link>

                    {isReserved && (
                      <Button
                        size="sm"
                        variant="primary"
                        loading={workingId === book.id}
                        disabled={workingId === book.id}
                        onClick={() => confirmSale(book.id)}
                        className="text-xs font-semibold"
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
