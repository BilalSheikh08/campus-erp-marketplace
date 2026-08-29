/**
 * Listing grid component - displays multiple listing cards.
 */

import PropTypes from 'prop-types';
import ListingCard from './ListingCard';

export default function ListingGrid({ listings, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg h-64 animate-pulse" />
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <p className="text-gray-600 text-lg">No listings found.</p>
        <p className="text-gray-500 text-sm">Try adjusting your filters or search query.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {listings.map(listing => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}

ListingGrid.propTypes = {
  listings: PropTypes.arrayOf(PropTypes.object).isRequired,
  isLoading: PropTypes.bool,
};
