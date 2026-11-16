/**
 * Modern Listing Grid component with shimmer skeleton loaders and empty state.
 */

import PropTypes from 'prop-types';
import { PackageSearch } from 'lucide-react';
import ListingCard from './ListingCard';

export default function ListingGrid({ listings, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-sm animate-pulse space-y-4"
          >
            <div className="w-full aspect-[4/3] bg-slate-200 rounded-xl" />
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="h-5 bg-slate-200 rounded w-20" />
              <div className="h-8 w-8 bg-slate-200 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="col-span-full bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
          <PackageSearch className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">No items match your criteria</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
          Try clearing your search query, adjusting your price filter, or switching to another campus domain category.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}

ListingGrid.propTypes = {
  listings: PropTypes.arrayOf(PropTypes.object).isRequired,
  isLoading: PropTypes.bool,
};
