/**
 * Campus Commons - Sell a Second-Hand Book
 * Student-to-student textbook listing form:
 * warm paper background, clear typography, and clean fields.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { createBook } from '../../services/booksApi';
import Alert from '../../components/shared/Alert';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import ImageUploader from '../../components/shared/ImageUploader';

const CONDITIONS = [
  ['new', 'New (Pristine)'],
  ['like_new', 'Like New (Barely used)'],
  ['good', 'Good (Clean with minor marks)'],
  ['fair', 'Fair (Highlighted / readable)'],
  ['worn', 'Worn (Heavy usage, complete)'],
];

export default function BookCreatePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    image_url: '',
    condition: 'good',
    author: '',
    subject: '',
    edition: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const book = await createBook({ ...form, price: Number(form.price) });
      navigate(`/books/${book.id}`);
    } catch (err) {
      const data = err.response?.data;
      const firstField = data && Object.keys(data)[0];
      const detail = data?.detail || (firstField && Array.isArray(data[firstField]) ? data[firstField][0] : null);
      setError(detail || 'Could not create the book listing.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] py-10 pb-24 text-zinc-900 font-sans">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-5 inline-flex items-center gap-1.5 text-xs font-mono text-zinc-600 hover:text-zinc-950 transition cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> BACK TO TEXTBOOK INDEX
        </button>

        <div className="bg-white rounded-lg border border-[#E4DDCF] p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#E4DDCF]">
            <div className="w-10 h-10 rounded bg-[#FAF8F3] border border-[#E4DDCF] flex items-center justify-center text-purple-900">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-900 mb-0.5">
                0% COMMISSION · PEER-TO-PEER EXCHANGE
              </div>
              <h1 className="font-serif text-2xl font-bold text-zinc-950">List a Textbook for Sale</h1>
            </div>
          </div>

          <p className="text-xs text-zinc-600 mb-6 leading-relaxed font-sans">
            Direct student-to-student exchange. List course textbooks, manuals, and study guides for peer pickup.
          </p>

          {error && (
            <div className="my-4">
              <Alert type="error" message={error} dismissible onClose={() => setError('')} />
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <Input
              label="Book Title"
              name="title"
              value={form.title}
              onChange={update}
              placeholder="e.g. Introduction to Algorithms (CLRS)"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Author(s)"
                name="author"
                value={form.author}
                onChange={update}
                placeholder="e.g. Cormen, Leiserson, Rivest"
              />
              <Input
                label="Course Subject / Branch"
                name="subject"
                value={form.subject}
                onChange={update}
                placeholder="e.g. Computer Science, 3rd Sem"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Book Condition
                </label>
                <select
                  name="condition"
                  value={form.condition}
                  onChange={update}
                  className="w-full text-xs px-3 py-2 rounded border border-[#E4DDCF] bg-[#FAF8F3] text-zinc-900 focus:outline-none focus:border-blue-900 font-sans"
                >
                  {CONDITIONS.map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Price (₹)"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={update}
                placeholder="e.g. 450.00"
                required
              />
            </div>

            <Input
              label="Edition / Year"
              name="edition"
              value={form.edition}
              onChange={update}
              placeholder="e.g. 4th Edition (2022)"
            />

            <ImageUploader
              label="Book Photo (Cover)"
              value={form.image_url}
              onChange={(url) => setForm((prev) => ({ ...prev, image_url: url }))}
            />

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-700 mb-1">
                Description / Condition Notes
              </label>
              <textarea
                name="description"
                rows={3}
                value={form.description}
                onChange={update}
                placeholder="Mention any missing pages, margin notes, or preferred campus pickup spots..."
                className="w-full text-xs px-3 py-2 rounded border border-[#E4DDCF] bg-[#FAF8F3] text-zinc-900 focus:outline-none focus:border-blue-900 font-sans placeholder:text-zinc-400"
              />
            </div>

            <div className="pt-3">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={saving}
                disabled={saving}
                className="w-full py-2.5 rounded text-xs font-semibold"
              >
                Publish Book Listing to Exchange
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
