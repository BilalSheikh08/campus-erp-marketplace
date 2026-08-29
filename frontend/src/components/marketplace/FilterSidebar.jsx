/**
 * Filter sidebar for marketplace browsing.
 * Filters by category, price range, and availability.
 */

import { X } from 'lucide-react';
import PropTypes from 'prop-types';
import Button from '../shared/Button';
import Input from '../shared/Input';

const CATEGORIES = [
  { value: 'canteen', label: '🍽️ Canteen' },
  { value: 'stationery', label: '📚 Stationery' },
  { value: 'hostel_supply', label: '🏠 Hostel Supplies' },
  { value: 'book', label: '📖 Used Books' },
];

export default function FilterSidebar({
  filters,
  onFilterChange,
  onClearFilters,
  isOpen = true,
  onClose,
}) {
  const handleCategoryChange = (category) => {
    onFilterChange({
      ...filters,
      category: filters.category === category ? null : category,
    });
  };

  const handlePriceChange = (type, value) => {
    const numValue = value === '' ? null : parseFloat(value);
    onFilterChange({
      ...filters,
      [type === 'min' ? 'minPrice' : 'maxPrice']: numValue,
    });
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:relative inset-y-0 left-0 w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto z-50 lg:z-auto transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 lg:hidden">
          <h2 className="font-semibold text-gray-900">Filters</h2>
          <button onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
            Category
          </h3>
          <div className="space-y-2">
            {CATEGORIES.map(cat => (
              <label key={cat.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.category === cat.value}
                  onChange={() => handleCategoryChange(cat.value)}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700">{cat.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Range Filter */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
            Price Range
          </h3>
          <div className="space-y-2">
            <Input
              type="number"
              placeholder="Min price"
              value={filters.minPrice || ''}
              onChange={e => handlePriceChange('min', e.target.value)}
              className="text-sm"
            />
            <Input
              type="number"
              placeholder="Max price"
              value={filters.maxPrice || ''}
              onChange={e => handlePriceChange('max', e.target.value)}
              className="text-sm"
            />
          </div>
        </div>

        {/* Clear Filters */}
        {(filters.category || filters.minPrice || filters.maxPrice) && (
          <Button
            variant="ghost"
            className="w-full text-sm"
            onClick={onClearFilters}
          >
            Clear Filters
          </Button>
        )}
      </div>
    </>
  );
}

FilterSidebar.propTypes = {
  filters: PropTypes.shape({
    category: PropTypes.string,
    minPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    maxPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onClearFilters: PropTypes.func.isRequired,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
};
