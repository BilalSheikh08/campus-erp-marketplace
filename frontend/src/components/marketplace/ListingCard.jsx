/**
 * Campus Exchange - Product Listing Card
 * High-legibility modern commerce card with SafeImage fallback,
 * real stock verification, and quick-add action.
 */

import { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { ShoppingCart, Check, Store } from 'lucide-react';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';
import SafeImage from '../shared/SafeImage';
import { formatPrice, getDomainLabel, getStockStatusLabel } from '../../utils/formatters';

export default function ListingCard({ listing }) {
  const { id, title, price, category_type: categoryType, image_url: imageUrl, stock_status: stockStatus, is_purchasable: isPurchasable, vendor_name: vendorName } = listing;
  const { addItem: addToCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const domainLabel = getDomainLabel(categoryType);
  const stockLabel = stockStatus ? getStockStatusLabel(stockStatus) : null;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    setIsAdding(true);
    try {
      await addToCart(id, 1);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    } catch {
      // silently handle
    } finally {
      setIsAdding(false);
    }
  };

  const domainBadgeStyles = {
    canteen: 'bg-orange-50 text-orange-700 border-orange-200',
    stationery: 'bg-sky-50 text-sky-700 border-sky-200',
    hostel_supply: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    hostel: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    book: 'bg-purple-50 text-purple-700 border-purple-200',
    books: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Product Image Cover */}
      <Link to={`/listings/${id}`} className="relative block aspect-[4/3] bg-slate-50 overflow-hidden">
        <SafeImage
          src={imageUrl}
          alt={title}
          domain={categoryType}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Domain Badge */}
        <div className="absolute top-3 left-3">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-xs border ${domainBadgeStyles[categoryType] || 'bg-white text-slate-800 border-slate-200'}`}>
            {domainLabel}
          </span>
        </div>

        {/* Stock Badge */}
        {stockStatus && (
          <div className="absolute top-3 right-3">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shadow-xs ${
                stockStatus === 'in_stock'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : stockStatus === 'low_stock'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              {stockLabel}
            </span>
          </div>
        )}
      </Link>

      {/* Content Area */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {vendorName && (
            <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5 mb-1.5 truncate">
              <Store className="h-3 w-3 text-blue-600" />
              <span>{vendorName}</span>
            </p>
          )}

          <Link to={`/listings/${id}`} className="block">
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
              {title}
            </h3>
          </Link>
        </div>

        {/* Price & Buy Action */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block leading-none">Campus Counter</span>
            <span className="text-base font-extrabold text-slate-900 font-mono mt-0.5 block">
              {formatPrice(price)}
            </span>
          </div>

          {isPurchasable ? (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isAdding}
              className={`p-2.5 rounded-xl transition flex items-center justify-center cursor-pointer ${
                justAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 hover:bg-blue-600 text-white shadow-xs active:scale-95'
              }`}
              title="Add to Cart"
              aria-label={`Add ${title} to cart`}
            >
              {justAdded ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
            </button>
          ) : (
            <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">
              Sold Out
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

ListingCard.propTypes = {
  listing: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    category_type: PropTypes.string.isRequired,
    image_url: PropTypes.string,
    stock_status: PropTypes.string,
    is_purchasable: PropTypes.bool,
    vendor_name: PropTypes.string,
  }).isRequired,
};
