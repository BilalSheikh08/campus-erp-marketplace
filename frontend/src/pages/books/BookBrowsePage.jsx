import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Plus, Search } from 'lucide-react';
import { fetchBooks } from '../../services/booksApi';
import useAuthStore from '../../store/authStore';
import Alert from '../../components/shared/Alert';
import Button from '../../components/shared/Button';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';

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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <p className="text-sm font-medium text-primary mb-1">Campus Marketplace</p>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2"><BookOpen className="h-8 w-8" /> Second-Hand Books</h1>
            <p className="text-gray-600 mt-2">Buy and sell course books directly with other students.</p>
          </div>
          {user?.role === 'student' ? (
            <Link to="/books/new"><Button className="gap-2"><Plus className="h-4 w-4" /> Sell a book</Button></Link>
          ) : !user ? (
            <Link to="/login"><Button className="gap-2"><Plus className="h-4 w-4" /> Sign in to sell a book</Button></Link>
          ) : null}
        </div>

        {error && <div className="mb-6"><Alert type="error" message={error} dismissible onClose={() => setError('')} /></div>}

        <form onSubmit={onSubmit} className="bg-white rounded-xl shadow-sm border p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input name="search" value={filters.search} onChange={updateFilter} placeholder="Search title, author, subject..." className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <select name="condition" value={filters.condition} onChange={updateFilter} className="rounded-lg border border-gray-300 px-3 py-2.5 bg-white">
              <option value="">Any condition</option>
              {CONDITIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <input name="min_price" value={filters.min_price} onChange={updateFilter} type="number" min="0" step="0.01" placeholder="Min ₹" className="rounded-lg border border-gray-300 px-3 py-2.5" />
            <div className="flex gap-2">
              <input name="max_price" value={filters.max_price} onChange={updateFilter} type="number" min="0" step="0.01" placeholder="Max ₹" className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2.5" />
              <Button type="submit">Search</Button>
            </div>
          </div>
        </form>

        {loading ? <LoadingSpinner message="Loading books..." /> : books.length === 0 ? (
          <div className="bg-white rounded-xl border shadow-sm"><EmptyState icon={<BookOpen className="mx-auto h-12 w-12" />} title="No books found" message="Try changing your search or price filters." /></div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {books.map((book) => (
                <Link key={book.id} to={`/books/${book.id}`} className="bg-white rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-44 bg-gray-100 flex items-center justify-center overflow-hidden">
                    {book.image_url ? <img src={book.image_url} alt={book.title} className="h-full w-full object-cover" /> : <BookOpen className="h-16 w-16 text-gray-300" />}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="font-semibold text-gray-900 line-clamp-2">{book.title}</h2>
                      <span className="shrink-0 text-lg font-bold text-primary">{money(book.price)}</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">{book.author || 'Author not provided'}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-1 rounded-full bg-indigo-50 text-indigo-700">{book.condition?.replace('_', ' ')}</span>
                      {book.subject && <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700">{book.subject}</span>}
                    </div>
                    <p className="mt-3 text-xs text-gray-500">Seller: {book.seller_name}</p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Button variant="ghost" disabled={!previous} onClick={() => loadBooks(page - 1)}>Previous</Button>
              <span className="text-sm text-gray-600">Page {page}</span>
              <Button variant="ghost" disabled={!next} onClick={() => loadBooks(page + 1)}>Next</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
