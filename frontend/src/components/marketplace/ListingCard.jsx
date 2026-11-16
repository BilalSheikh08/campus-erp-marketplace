/**
 * Campus Exchange - Product Listing Card
 * Redesigned with university catalog folio aesthetic:
 * warm paper border, crisp typography, official stock indicators,
 * and role-aware cart actions.
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
  const { isAuthenticated, user } = useAuthStore();
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const domainLabel = getDomainLabel(categoryType);
  const stockLabel = stockStatus ? getStockStatusLabel(stockStatus) : null;
  const isStudentOrGuest = !isAuthenticated || user?.role === 'student';

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    if (user?.role !== 'student') {
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
    canteen: 'bg-amber-50 text-amber-900 border-amber-300',
    stationery: 'bg-sky-50 text-sky-900 border-sky-300',
    hostel_supply: 'bg-emerald-50 text-emerald-900 border-emerald-300',
    hostel: 'bg-emerald-50 text-emerald-900 border-emerald-300',
    book: 'bg-purple-50 text-purple-900 border-purple-300',
    books: 'bg-purple-50 text-purple-900 border-purple-300',
  };

  return (
    <div className="group relative flex flex-col bg-white rounded-lg border border-[#E4DDCF] hover:border-zinc-400 transition-colors shadow-xs overflow-hidden">
      {/* Product Image Folio */}
      <Link to={`/listings/${id}`} className="relative block aspect-[4/3] bg-[#FAF8F3] overflow-hidden border-b border-[#E4DDCF]">
        <SafeImage
          src={imageUrl}
          alt={title}
          domain={categoryType}
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-200"
        />

        {/* Domain Stamp */}
        <div className="absolute top-2.5 left-2.5">
          <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border shadow-xs ${domainBadgeStyles[categoryType] || 'bg-white text-zinc-800 border-[#E4DDCF]'}`}>
            {domainLabel}
          </span>
        </div>

        {/* Stock Status Stamp */}
        {stockStatus && (
          <div className="absolute top-2.5 right-2.5">
            <span
              className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border shadow-xs ${
                stockStatus === 'in_stock'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : stockStatus === 'low_stock'
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-red-50 text-red-800 border-red-300'
              }`}
            >
              {stockLabel}
            </span>
          </div>
        )}
      </Link>

      {/* Content Folio Area */}
      <div className="p-4 flex flex-col flex-1 justify-between bg-white">
        <div>
          {vendorName && (
            <p className="text-[11px] font-mono text-zinc-500 flex items-center gap-1.5 mb-1.5 truncate">
              <Store className="h-3 w-3 text-zinc-400" />
              <span>{vendorName}</span>
            </p>
          )}

          <Link to={`/listings/${id}`} className="block">
            <h3 className="font-serif text-sm font-bold text-zinc-950 group-hover:text-blue-900 transition-colors line-clamp-2 leading-snug">
              {title}
            </h3>
          </Link>
        </div>

        {/* Price & Action */}
        <div className="mt-4 pt-3 border-t border-[#E4DDCF] flex items-center justify-between gap-2">
          <div>
            <span className="text-[9px] font-mono uppercase font-bold text-zinc-400 block leading-none">Counter Rate</span>
            <span className="text-base font-bold text-zinc-950 font-mono mt-0.5 block">
              {formatPrice(price)}
            </span>
          </div>

          {isStudentOrGuest ? (
            isPurchasable ? (
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAdding}
                className={`p-2 rounded-md transition-colors flex items-center justify-center cursor-pointer ${
                  justAdded
                    ? 'bg-emerald-800 text-white'
                    : 'bg-zinc-900 hover:bg-blue-900 text-white shadow-xs'
                }`}
                title="Add to Cart"
                aria-label={`Add ${title} to cart`}
              >
                {justAdded ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
              </button>
            ) : (
              <span className="text-[10px] font-mono font-medium text-zinc-500 bg-[#FAF8F3] border border-[#E4DDCF] px-2 py-0.5 rounded">
                Out of Stock
              </span>
            )
          ) : (
            <Link
              to={`/listings/${id}`}
              className="text-[10px] font-mono text-zinc-500 hover:text-zinc-900 bg-[#FAF8F3] border border-[#E4DDCF] px-2 py-1 rounded"
            >
              Inspect
            </Link>
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
