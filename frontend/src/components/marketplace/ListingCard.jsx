/**
 * Listing card component - displays a single product/listing.
 */

import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { MapPin } from 'lucide-react';
import { formatPrice } from '../../utils/formatters';

const CATEGORY_LABELS = {
  canteen: '🍽️ Canteen',
  stationery: '📚 Stationery',
  hostel_supply: '🏠 Hostel',
  book: '📖 Book',
};

const STATUS_COLORS = {
  in_stock: 'bg-green-100 text-green-800',
  low_stock: 'bg-yellow-100 text-yellow-800',
  out_of_stock: 'bg-red-100 text-red-800',
};

export default function ListingCard({ listing }) {
  const {
    id,
    title,
    price,
    image_url: imageUrl,
    category_type: categoryType,
    stock_status: stockStatus,
    vendor_name: vendorName,
    book_detail: bookDetail,
  } = listing;

  const categoryLabel = CATEGORY_LABELS[categoryType] || categoryType;
  const stockColor = statusColors[stockStatus] || 'bg-gray-100 text-gray-800';

  return (
    <Link to={`/listings/${id}`}>
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden h-full flex flex-col">
        {/* Image */}
        <div className="w-full h-40 bg-gray-200 flex items-center justify-center overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="text-4xl">{categoryLabel.split(' ')[0]}</div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex-grow flex flex-col">
          {/* Title */}
          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
            {title}
          </h3>

          {/* Category & Stock Badge */}
          <div className="flex items-center justify-between mb-3 gap-2">
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
              {categoryLabel}
            </span>
            {stockStatus && (
              <span className={`text-xs px-2 py-1 rounded font-medium ${stockColor}`}>
                {stockStatus === 'in_stock' && 'In Stock'}
                {stockStatus === 'low_stock' && 'Low Stock'}
                {stockStatus === 'out_of_stock' && 'Out of Stock'}
              </span>
            )}
          </div>

          {/* Vendor Info */}
          {vendorName && (
            <div className="flex items-center gap-1 text-xs text-gray-600 mb-3">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{vendorName}</span>
            </div>
          )}

          {/* Book Details */}
          {bookDetail && (
            <div className="text-xs text-gray-600 mb-3 space-y-1">
              {bookDetail.author && <p className="truncate">Author: {bookDetail.author}</p>}
              {bookDetail.condition && (
                <p>
                  Condition:{' '}
                  <span className="font-medium capitalize">{bookDetail.condition}</span>
                </p>
              )}
            </div>
          )}

          {/* Price (Bottom) */}
          <div className="mt-auto pt-3 border-t">
            <p className="text-lg font-bold text-primary">
              {formatPrice(price)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

ListingCard.propTypes = {
  listing: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    image_url: PropTypes.string,
    category_type: PropTypes.string.isRequired,
    stock_status: PropTypes.string,
    vendor_name: PropTypes.string,
    book_detail: PropTypes.object,
  }).isRequired,
};

const statusColors = STATUS_COLORS;
