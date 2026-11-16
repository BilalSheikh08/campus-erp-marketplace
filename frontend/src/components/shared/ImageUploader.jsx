import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { UploadCloud, X, Sparkles } from 'lucide-react';
import client from '../../api/client';

const PRESETS = [
  { label: '🍕 Margherita Pizza', url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80' },
  { label: '🌯 Paneer Wrap', url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&q=80' },
  { label: '☕ Cold Brew Coffee', url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=800&q=80' },
  { label: '📓 Spiral Notebook', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80' },
  { label: '🔢 Scientific Calculator', url: 'https://images.unsplash.com/photo-1611125832047-1d7ad1e8e48f?w=800&q=80' },
  { label: '⚡ Electric Kettle', url: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=800&q=80' },
  { label: '💡 Study Desk Lamp', url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80' },
  { label: '📚 Algorithms Textbook', url: 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?w=800&q=80' },
  { label: '📖 Clean Code Book', url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80' },
];

export default function ImageUploader({ value, onChange, label = 'Product Image' }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [showPresets, setShowPresets] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    setError('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await client.post('/api/listings/upload-image/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.url) {
        onChange(res.data.url);
      }
    } catch (err) {
      setError(err.response?.data?.image || 'Failed to upload image. Please try another.');
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold uppercase tracking-wider text-ink-700">{label}</label>
        <button
          type="button"
          onClick={() => setShowPresets(!showPresets)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-forest-700 hover:text-forest-800 transition"
        >
          <Sparkles className="h-3.5 w-3.5" />
          {showPresets ? 'Hide Presets' : 'Choose Campus Preset'}
        </button>
      </div>

      {showPresets && (
        <div className="p-3 bg-paper-100 rounded-lg border border-paper-200 mb-2">
          <p className="text-xs text-ink-700 font-medium mb-2">Select a standard campus photo preset:</p>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.url}
                type="button"
                onClick={() => {
                  onChange(p.url);
                  setShowPresets(false);
                }}
                className={`text-xs px-2.5 py-1.5 rounded-md border transition ${
                  value === p.url
                    ? 'bg-forest-600 text-white border-forest-600 font-medium'
                    : 'bg-white text-ink-700 border-paper-200 hover:border-forest-400'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {value ? (
        <div className="relative rounded-lg border border-paper-200 overflow-hidden bg-paper-100 group">
          <img
            src={value}
            alt="Preview"
            className="w-full h-48 object-cover transition duration-300 group-hover:scale-105"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80';
            }}
          />
          <div className="absolute inset-0 bg-ink-900/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-paper-50 text-ink-900 text-xs font-semibold rounded-md shadow-sm hover:bg-white transition"
            >
              Change Photo
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-1.5 bg-terracotta-500 text-white rounded-md shadow-sm hover:bg-terracotta-600 transition"
              title="Remove"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-paper-300 hover:border-forest-600 rounded-lg p-6 text-center cursor-pointer transition bg-paper-50/60 hover:bg-paper-100/60"
        >
          <UploadCloud className="h-7 w-7 mx-auto text-ink-400 mb-2" />
          <p className="text-xs font-semibold text-ink-800">
            {uploading ? 'Uploading to Campus Media...' : 'Click or drag image to upload'}
          </p>
          <p className="text-[11px] text-ink-400 mt-1">PNG, JPG, WEBP up to 10MB</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        className="hidden"
      />

      <div className="flex items-center gap-2 pt-1">
        <span className="text-[11px] text-ink-400 font-medium">Or paste image URL:</span>
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://images.unsplash.com/..."
          className="flex-1 text-xs px-2.5 py-1.5 border border-paper-200 rounded-lg focus:outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600 bg-white text-ink-900"
        />
      </div>

      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
    </div>
  );
}

ImageUploader.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
};
