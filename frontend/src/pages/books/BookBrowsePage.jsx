/**
 * Campus Commons - Student Used Books Peer-to-Peer Exchange
 * Browse curriculum textbooks, filter by condition and price, and list books for sale.
 */

import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Plus, Search, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { fetchBooks } from '../../services/booksApi';
import useAuthStore from '../../store/authStore';
import Alert from '../../components/shared/Alert';
import Button from '../../components/shared/Button';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SafeImage from '../../components/shared/SafeImage';

const CONDITIONS = [
  ['new', 'New'],
  ['like_new', 'Like New'],
  ['good', 'Good'],
  ['fair', 'Fair'],
  ['worn', 'Worn'],
];

function resultsFrom(data) {
  return Array.isArray(data) ? data : data?.results || [];
}

function money(value) {
  return `₹${Number(value || 0).toFixed(2)}`;
}

export default function BookBrowsePage() {
  const { user } = useAuthStore();
  const [filters, setFilters] = useState({ search: '', condition: '', min_price: '', max_price: '' });
  const [appliedFilters, setAppliedFilters] = useState({ search: '', condition: '', min_price: '', max_price: '' });
  const [books, setBooks] = useState([]);
  const [next, setNext] = useState(null);
  const [previous, setPrevious] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadBooks = useCallback(async (targetPage = 1) => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchBooks({ ...appliedFilters, page: targetPage, page_size: 12 });
      setBooks(resultsFrom(data));
      setNext(Array.isArray(data) ? null : data?.next || null);
      setPrevious(Array.isArray(data) ? null : data?.previous || null);
      setPage(targetPage);
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not load books.');
    } finally {
      setLoading(false);
    }
  }, [appliedFilters]);

  useEffect(() => {
    loadBooks(1);
  }, [loadBooks]);

  const updateFilter = (event) => {
    setFilters((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const onSubmit = (event) => {
    event.preventDefault();
    setAppliedFilters({ ...filters });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
      {/* Header Banner */}
      <div className="bg-white border-b border-slate-200 pt-10 pb-8 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold mb-2.5 border border-purple-200">
              <Sparkles className="h-3.5 w-3.5 text-purple-600" />
              <span>0% Commission • Student-to-Student Exchange</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-purple-600" />
              <span>Used Books Exchange</span>
            </h1>
            <p className="text-slate-500 mt-1 text-xs sm:text-sm max-w-xl">
              Buy and sell engineering textbooks, exam preparation guides, and reference manuals directly with peers across campus.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {user?.role === 'student' ? (
              <Link to="/books/new">
                <Button variant="blue" className="flex items-center gap-2 py-2.5 px-5 rounded-2xl font-bold shadow-xs">
                  <Plus className="h-4 w-4" />
                  <span>List a Book for Sale</span>
                </Button>
              </Link>
            ) : !user ? (
              <Link to="/login">
                <Button variant="blue" className="flex items-center gap-2 py-2.5 px-5 rounded-2xl font-bold shadow-xs">
                  <Plus className="h-4 w-4" />
                  <span>Sign In to Sell Books</span>
                </Button>
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {error && (
          <div className="mb-6">
            <Alert type="error" message={error} dismissible onClose={() => setError('')} />
          </div>
        )}

        {/* Filter Card */}
        <form onSubmit={onSubmit} className="bg-white rounded-3xl border border-slate-200 p-4 mb-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 items-center">
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                name="search"
                value={filters.search}
                onChange={updateFilter}
                placeholder="Search title, author, course code..."
                className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-slate-50 transition"
              />
            </div>
            <select
              name="condition"
              value={filters.condition}
              onChange={updateFilter}
              className="rounded-2xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer"
            >
              <option value="">Any Condition</option>
              {CONDITIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <input
              name="min_price"
              value={filters.min_price}
              onChange={updateFilter}
              type="number"
              min="0"
              step="0.01"
              placeholder="Min Price (₹)"
              className="rounded-2xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-slate-50"
            />
            <div className="flex gap-2">
              <input
                name="max_price"
                value={filters.max_price}
                onChange={updateFilter}
                type="number"
                min="0"
                step="0.01"
                placeholder="Max Price (₹)"
                className="min-w-0 flex-1 rounded-2xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-slate-50"
              />
              <Button type="submit" variant="blue" className="font-bold px-5 py-2.5 rounded-2xl text-xs sm:text-sm">
                Filter
              </Button>
            </div>
          </div>
        </form>

        {/* Results */}
        {loading ? (
          <LoadingSpinner message="Scanning textbook catalog..." />
        ) : books.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
            <EmptyState
              icon={<BookOpen className="mx-auto h-12 w-12 text-slate-300" />}
              title="No course books found"
              message="Try broadening your search term or adjusting your price filters."
            />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {books.map((book) => (
                <Link
                  key={book.id}
                  to={`/books/${book.id}`}
                  className="bg-white rounded-3xl border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col group"
                >
                  <div className="relative aspect-[4/3] bg-slate-50 overflow-hidden">
                    <SafeImage
                      src={book.image_url}
                      alt={book.title}
                      domain="book"
                      category="book"
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-3 left-3 z-10 text-[10px] font-bold px-2.5 py-1 rounded-md bg-white/95 text-purple-700 border border-purple-200 uppercase tracking-wider shadow-xs">
                      {book.condition?.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h2 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 text-sm leading-snug">
                        {book.title}
                      </h2>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-1 mb-2">
                        {book.author ? `by ${book.author}` : 'Author unspecified'}
                      </p>

                      {book.subject && (
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium mb-2.5">
                          {book.subject}
                        </span>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Student Price</span>
                        <span className="text-base font-extrabold text-slate-900 font-mono">
                          {money(book.price)}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-purple-600 group-hover:underline">
                        View Details →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {(next || previous) && (
              <div className="mt-12 flex items-center justify-between border-t border-slate-200 pt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => previous && loadBooks(page - 1)}
                  disabled={!previous}
                  className="gap-1.5"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <span className="text-xs font-mono font-semibold text-slate-500">
                  Page {page}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => next && loadBooks(page + 1)}
                  disabled={!next}
                  className="gap-1.5"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
