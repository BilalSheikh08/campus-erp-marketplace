/**
 * Campus Commons - Student Used Books Peer-to-Peer Exchange
 * Redesigned with academic folio & student exchange aesthetic:
 * warm paper background, monospace price & course tags, and clear condition stamps.
 */

import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchBooks } from '../../services/booksApi';
import useAuthStore from '../../store/authStore';
import Alert from '../../components/shared/Alert';
import Button from '../../components/shared/Button';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SafeImage from '../../components/shared/SafeImage';

const CONDITIONS = [
  ['new', 'Brand New'],
  ['like_new', 'Like New'],
  ['good', 'Good Condition'],
  ['fair', 'Fair / Readable'],
  ['worn', 'Marked / Worn'],
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
    <div className="min-h-screen bg-[#F8F6F0] text-zinc-900 pb-24 font-sans">
      {/* Header Banner */}
      <div className="bg-[#FAF8F3] border-b border-[#E4DDCF] pt-8 pb-6 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
              <BookOpen className="h-3.5 w-3.5 text-purple-900" />
              <span>STUDENT DESK · PEER-TO-PEER ACADEMIC EXCHANGE</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-zinc-950 tracking-tight">
              Used Textbooks Exchange
            </h1>
            <p className="text-zinc-600 mt-1 text-xs sm:text-sm max-w-xl font-sans">
              Buy and sell engineering course texts, examination preparation sets, and reference manuals directly with campus peers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {user?.role === 'student' ? (
              <Link to="/books/new">
                <Button variant="primary" size="md" className="flex items-center gap-1.5 text-xs font-semibold">
                  <Plus className="h-3.5 w-3.5" />
                  <span>List a Book for Sale</span>
                </Button>
              </Link>
            ) : !user ? (
              <Link to="/login">
                <Button variant="primary" size="md" className="flex items-center gap-1.5 text-xs font-semibold">
                  <Plus className="h-3.5 w-3.5" />
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
        <form onSubmit={onSubmit} className="bg-white rounded-lg border border-[#E4DDCF] p-3.5 mb-8 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2.5 items-center">
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                name="search"
                value={filters.search}
                onChange={updateFilter}
                placeholder="Search title, author, course code..."
                className="w-full rounded border border-[#E4DDCF] pl-9 pr-3 py-1.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-blue-900 bg-[#FAF8F3] font-sans"
              />
            </div>
            <select
              name="condition"
              value={filters.condition}
              onChange={updateFilter}
              className="rounded border border-[#E4DDCF] px-2.5 py-1.5 text-xs text-zinc-800 bg-[#FAF8F3] focus:outline-none focus:border-blue-900 cursor-pointer font-sans"
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
              placeholder="Min Rate (₹)"
              className="rounded border border-[#E4DDCF] px-2.5 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-blue-900 bg-[#FAF8F3] font-mono"
            />
            <div className="flex gap-2">
              <input
                name="max_price"
                value={filters.max_price}
                onChange={updateFilter}
                type="number"
                min="0"
                step="0.01"
                placeholder="Max Rate (₹)"
                className="min-w-0 flex-1 rounded border border-[#E4DDCF] px-2.5 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-blue-900 bg-[#FAF8F3] font-mono"
              />
              <Button type="submit" variant="primary" size="sm" className="text-xs font-semibold px-4">
                Filter
              </Button>
            </div>
          </div>
        </form>

        {/* Results */}
        {loading ? (
          <LoadingSpinner message="Scanning textbook registry..." />
        ) : books.length === 0 ? (
          <div className="bg-white rounded-lg border border-[#E4DDCF] p-10 text-center shadow-xs">
            <EmptyState
              icon={<BookOpen className="mx-auto h-8 w-8 text-zinc-400" />}
              title="No course books found"
              message="Try broadening your search term or adjusting your condition and rate filters."
            />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {books.map((book) => (
                <Link
                  key={book.id}
                  to={`/books/${book.id}`}
                  className="bg-white rounded-lg border border-[#E4DDCF] hover:border-zinc-400 transition-colors shadow-xs overflow-hidden flex flex-col group"
                >
                  <div className="relative aspect-[4/3] bg-[#FAF8F3] overflow-hidden border-b border-[#E4DDCF]">
                    <SafeImage
                      src={book.image_url}
                      alt={book.title}
                      domain="book"
                      category="book"
                      className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-200"
                    />
                    <span className="absolute top-2.5 left-2.5 z-10 text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-white text-purple-900 border border-purple-300 uppercase tracking-wider shadow-xs">
                      {book.condition?.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h2 className="font-serif text-sm font-bold text-zinc-950 group-hover:text-blue-900 transition-colors line-clamp-2 leading-snug">
                        {book.title}
                      </h2>
                      <p className="text-xs font-mono text-zinc-500 line-clamp-1 mt-1 mb-2">
                        {book.author ? `by ${book.author}` : 'Author unspecified'}
                      </p>

                      {book.subject && (
                        <span className="inline-block px-2 py-0.5 rounded border border-[#E4DDCF] bg-[#FAF8F3] text-zinc-700 text-[10px] font-mono mb-2">
                          {book.subject}
                        </span>
                      )}
                    </div>

                    <div className="pt-3 border-t border-[#E4DDCF] flex items-center justify-between mt-auto">
                      <div>
                        <span className="text-[9px] font-mono text-zinc-400 block uppercase font-bold">Peer Price</span>
                        <span className="text-sm font-bold text-zinc-950 font-mono">
                          {money(book.price)}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-blue-900 group-hover:underline">
                        Details →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {(next || previous) && (
              <div className="mt-10 flex items-center justify-between border-t border-[#E4DDCF] pt-6 font-mono text-xs">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => previous && loadBooks(page - 1)}
                  disabled={!previous}
                  className="gap-1.5"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Previous Folio
                </Button>

                <span className="text-xs font-semibold text-zinc-600">
                  Folio {page}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => next && loadBooks(page + 1)}
                  disabled={!next}
                  className="gap-1.5"
                >
                  Next Folio
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
