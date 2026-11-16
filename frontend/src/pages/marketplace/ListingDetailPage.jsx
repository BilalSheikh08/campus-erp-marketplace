/**
 * Campus Commons - Listing Detail Page
 * High-clarity campus product showcase with SafeImage fallback,
 * real stock verification, operational metadata, and student review pipeline.
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  BookOpen,
  Utensils,
  Package,
  ShoppingCart,
  ShieldCheck,
  Clock,
  ChevronRight,
  Store,
  CheckCircle,
} from 'lucide-react';
import useListingsStore from '../../store/listingsStore';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/shared/Alert';
import Button from '../../components/shared/Button';
import SafeImage from '../../components/shared/SafeImage';
import ReviewSection from '../../components/marketplace/ReviewSection';
import { formatPrice, getDomainLabel, getStockStatusLabel } from '../../utils/formatters';

const DOMAIN_ICONS = {
  canteen: <Utensils className="h-4 w-4" />,
  stationery: <Package className="h-4 w-4" />,
  hostel_supply: <Package className="h-4 w-4" />,
  book: <BookOpen className="h-4 w-4" />,
};

export default function ListingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [addToCartLoading, setAddToCartLoading] = useState(false);
  const [addToCartMessage, setAddToCartMessage] = useState(null);
  const { currentListing, isLoading, error, fetchListing } = useListingsStore();
  const { addItem: addToCart, clearError: clearCartError } = useCartStore();

  useEffect(() => {
    fetchListing(id);
  }, [id, fetchListing]);

  if (isLoading) {
    return <LoadingSpinner message="Loading catalog item..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <Alert type="error" title="Error Loading Product" message={error} />
          <Button onClick={() => navigate('/marketplace')} className="mt-6 w-full">
            Return to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  if (!currentListing) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <Package className="h-10 w-10 text-slate-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900 mb-1">Item Not Found</h2>
          <p className="text-slate-500 text-xs mb-6">This item may have been archived or removed from the campus catalog.</p>
          <Button onClick={() => navigate('/marketplace')} className="w-full">
            Browse All Products
          </Button>
        </div>
      </div>
    );
  }

  const {
    title,
    description,
    price,
    category_type: categoryType,
    image_url: imageUrl,
    stock_status: stockStatus,
    is_purchasable: isPurchasable,
    vendor_name: vendorName,
    canteen_detail: canteenDetail,
    stationery_detail: stationeryDetail,
    hostel_supply_detail: hostelSupplyDetail,
    book_detail: bookDetail,
  } = currentListing;

  const domainLabel = getDomainLabel(categoryType);
  const stockLabel = stockStatus ? getStockStatusLabel(stockStatus) : null;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setAddToCartLoading(true);
    setAddToCartMessage(null);
    clearCartError();
    try {
      await addToCart(currentListing.id, 1);
      setAddToCartMessage({ type: 'success', text: 'Added to cart successfully!' });
      setTimeout(() => setAddToCartMessage(null), 3000);
    } catch (err) {
      setAddToCartMessage({
        type: 'error',
        text: err.response?.data?.detail || 'Failed to add item to cart',
      });
    } finally {
      setAddToCartLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-6">
          <Link to="/" className="hover:text-blue-600 transition">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <Link to="/marketplace" className="hover:text-blue-600 transition">
            Marketplace
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <Link to={`/marketplace/${categoryType || 'all'}`} className="capitalize hover:text-blue-600 transition">
            {domainLabel}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-slate-900 font-semibold truncate max-w-xs">{title}</span>
        </nav>

        {/* Cart Action Feedback Alert */}
        {addToCartMessage && (
          <div className="mb-6 animate-in fade-in duration-150">
            <Alert
              type={addToCartMessage.type}
              message={addToCartMessage.text}
              dismissible
              onClose={() => setAddToCartMessage(null)}
            />
          </div>
        )}

        {/* Main Product Showcase Card */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-10">
            {/* Left Column: Image Showcase */}
            <div className="lg:col-span-6 flex flex-col">
              <div className="relative w-full aspect-[4/3] rounded-2xl bg-slate-50 overflow-hidden border border-slate-200 flex items-center justify-center">
                <SafeImage
                  src={imageUrl}
                  alt={title}
                  domain={categoryType}
                  className="w-full h-full object-cover"
                />

                {/* Badges on image */}
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-sm text-xs font-bold text-slate-800 border border-slate-200 shadow-sm">
                    {DOMAIN_ICONS[categoryType]}
                    <span>{domainLabel}</span>
                  </span>
                </div>
              </div>

              {/* Security & Pickup Trust Badges */}
              <div className="mt-6 grid grid-cols-2 gap-3 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Real-time stock verification</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Clock className="h-4 w-4 text-blue-600 shrink-0" />
                  <span>Instant 4-digit pickup PIN</span>
                </div>
              </div>
            </div>

            {/* Right Column: Product Information & Action Panel */}
            <div className="lg:col-span-6 flex flex-col justify-between">
              <div>
                {/* Stock Status Badge & Vendor Name */}
                <div className="flex items-center justify-between mb-3">
                  {stockStatus && (
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                        stockStatus === 'in_stock'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : stockStatus === 'low_stock'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          stockStatus === 'in_stock'
                            ? 'bg-emerald-500'
                            : stockStatus === 'low_stock'
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                      />
                      <span>{stockLabel}</span>
                    </span>
                  )}

                  {vendorName && (
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                      <Store className="h-4 w-4 text-blue-600" />
                      <span>{vendorName}</span>
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug mb-4">
                  {title}
                </h1>

                {/* Price Display */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 mb-6 flex items-baseline justify-between">
                  <div>
                    <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
                      Campus Counter Price
                    </span>
                    <div className="text-3xl font-mono font-extrabold text-slate-900 tracking-tight mt-0.5">
                      {formatPrice(price)}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Verified Campus Listing
                  </span>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Item Overview
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {description || 'Official campus supplies prepared for direct counter handover.'}
                  </p>
                </div>

                {/* Domain Specific Attributes */}
                {canteenDetail && (
                  <div className="p-4 rounded-xl bg-orange-50/60 border border-orange-100 mb-6 text-xs space-y-2">
                    <p className="font-bold text-orange-950 uppercase tracking-wider text-[11px]">Canteen Kitchen Details</p>
                    <div className="grid grid-cols-2 gap-2 text-slate-700">
                      <div>Prep Time: <strong className="text-slate-900">{canteenDetail.prep_time_minutes || 10} mins</strong></div>
                      <div>Dietary: <strong className="text-slate-900">{canteenDetail.is_vegetarian ? 'Vegetarian' : 'Standard'}</strong></div>
                    </div>
                  </div>
                )}

                {stationeryDetail && (
                  <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-100 mb-6 text-xs space-y-2">
                    <p className="font-bold text-sky-950 uppercase tracking-wider text-[11px]">Stationery Specifications</p>
                    <div className="grid grid-cols-2 gap-2 text-slate-700">
                      {stationeryDetail.brand && <div>Brand: <strong className="text-slate-900">{stationeryDetail.brand}</strong></div>}
                      {stationeryDetail.paper_type && <div>Type: <strong className="text-slate-900">{stationeryDetail.paper_type}</strong></div>}
                    </div>
                  </div>
                )}

                {hostelSupplyDetail && (
                  <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 mb-6 text-xs space-y-2">
                    <p className="font-bold text-emerald-950 uppercase tracking-wider text-[11px]">Hostel Requisition Info</p>
                    <p className="text-slate-700">This equipment is officially registered and requires warden verification upon checkout.</p>
                  </div>
                )}

                {bookDetail && (
                  <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100 mb-6 text-xs space-y-2">
                    <p className="font-bold text-purple-950 uppercase tracking-wider text-[11px]">Textbook Information</p>
                    <div className="grid grid-cols-2 gap-2 text-slate-700">
                      {bookDetail.edition && <div>Edition: <strong className="text-slate-900">{bookDetail.edition}</strong></div>}
                      {bookDetail.condition && <div>Condition: <strong className="text-slate-900 capitalize">{bookDetail.condition}</strong></div>}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-slate-100 space-y-3">
                {isPurchasable ? (
                  <Button
                    onClick={handleAddToCart}
                    loading={addToCartLoading}
                    variant="blue"
                    size="lg"
                    className="w-full py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-sm"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span>Add to Campus Cart</span>
                  </Button>
                ) : (
                  <Button disabled size="lg" className="w-full py-3.5 rounded-2xl bg-slate-200 text-slate-500 font-bold">
                    Currently Out of Stock
                  </Button>
                )}

                <div className="flex items-center justify-between text-xs text-slate-500 px-2">
                  <span>Direct counter collection</span>
                  <span>4-Digit PIN with instant verification</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm">
          <ReviewSection listingId={id} />
        </div>
      </div>
    </div>
  );
}
