/**
 * Campus Commons - Listing Detail Page
 * University Requisition & Item Specification Folio:
 * High-clarity campus item details, verified stock status,
 * role-aware ordering rules, and student reviews ledger.
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
  canteen: <Utensils className="h-3.5 w-3.5" />,
  stationery: <Package className="h-3.5 w-3.5" />,
  hostel_supply: <Package className="h-3.5 w-3.5" />,
  book: <BookOpen className="h-3.5 w-3.5" />,
};

export default function ListingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [addToCartLoading, setAddToCartLoading] = useState(false);
  const [addToCartMessage, setAddToCartMessage] = useState(null);
  const { currentListing, isLoading, error, fetchListing } = useListingsStore();
  const { addItem: addToCart, clearError: clearCartError } = useCartStore();

  useEffect(() => {
    fetchListing(id);
  }, [id, fetchListing]);

  if (isLoading) {
    return <LoadingSpinner message="Consulting central catalog record..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8F6F0] flex items-center justify-center px-4 font-sans">
        <div className="text-center max-w-md w-full bg-white p-6 rounded-lg border border-[#E4DDCF] shadow-xs">
          <Alert type="error" title="Record Retrieval Failed" message={error} />
          <Button onClick={() => navigate('/marketplace')} className="mt-5 w-full">
            Return to Marketplace Index
          </Button>
        </div>
      </div>
    );
  }

  if (!currentListing) {
    return (
      <div className="min-h-screen bg-[#F8F6F0] flex items-center justify-center px-4 font-sans">
        <div className="text-center max-w-md w-full bg-white p-6 rounded-lg border border-[#E4DDCF] shadow-xs">
          <Package className="h-10 w-10 text-zinc-400 mx-auto mb-3" />
          <h2 className="font-serif text-lg font-bold text-zinc-900 mb-1">Catalog Item Not Found</h2>
          <p className="text-zinc-500 text-xs mb-5 font-sans">This item entry may have been archived or removed from the campus catalog.</p>
          <Button onClick={() => navigate('/marketplace')} className="w-full">
            Browse All Concessions
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
    if (user?.role !== 'student') {
      setAddToCartMessage({
        type: 'error',
        text: 'Ordering Reserved for Students (Staff Inspection Mode)',
      });
      return;
    }
    setAddToCartLoading(true);
    setAddToCartMessage(null);
    clearCartError();
    try {
      await addToCart(currentListing.id, 1);
      setAddToCartMessage({ type: 'success', text: 'Item appended to your active student cart slip!' });
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
    <div className="min-h-screen bg-[#F8F6F0] text-zinc-900 py-8 pb-24 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Archival Breadcrumb Trail */}
        <nav className="flex items-center gap-1.5 text-xs font-mono text-zinc-500 mb-6">
          <Link to="/" className="hover:text-zinc-900 transition">
            HOME
          </Link>
          <ChevronRight className="h-3 w-3 text-zinc-400" />
          <Link to="/marketplace" className="hover:text-zinc-900 transition">
            MARKETPLACE
          </Link>
          <ChevronRight className="h-3 w-3 text-zinc-400" />
          <Link to={`/marketplace/${categoryType || 'all'}`} className="uppercase hover:text-zinc-900 transition">
            {domainLabel}
          </Link>
          <ChevronRight className="h-3 w-3 text-zinc-400" />
          <span className="text-zinc-900 font-semibold truncate max-w-xs">{title}</span>
        </nav>

        {/* Action Feedback Alert */}
        {addToCartMessage && (
          <div className="mb-6 animate-in fade-in duration-100">
            <Alert
              type={addToCartMessage.type}
              message={addToCartMessage.text}
              dismissible
              onClose={() => setAddToCartMessage(null)}
            />
          </div>
        )}

        {/* Item Specification Sheet */}
        <div className="bg-white rounded-lg border border-[#E4DDCF] overflow-hidden shadow-xs mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8">
            {/* Left Column: Image Folio */}
            <div className="lg:col-span-6 flex flex-col">
              <div className="relative w-full aspect-[4/3] rounded bg-[#FAF8F3] overflow-hidden border border-[#E4DDCF] flex items-center justify-center">
                <SafeImage
                  src={imageUrl}
                  alt={title}
                  domain={categoryType}
                  className="w-full h-full object-cover"
                />

                {/* Badges on image */}
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white text-xs font-mono font-bold text-zinc-800 border border-[#E4DDCF] shadow-xs">
                    {DOMAIN_ICONS[categoryType]}
                    <span>{domainLabel}</span>
                  </span>
                </div>
              </div>

              {/* Concession Verification Notes */}
              <div className="mt-4 grid grid-cols-2 gap-3 pt-4 border-t border-[#E4DDCF] font-mono text-[11px] text-zinc-600">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0" />
                  <span>Stock lock on checkout</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-blue-900 shrink-0" />
                  <span>4-Digit PIN pickup</span>
                </div>
              </div>
            </div>

            {/* Right Column: Information & Order Action */}
            <div className="lg:col-span-6 flex flex-col justify-between">
              <div>
                {/* Stock & Vendor Stamping */}
                <div className="flex items-center justify-between mb-3">
                  {stockStatus && (
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                        stockStatus === 'in_stock'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : stockStatus === 'low_stock'
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-red-50 text-red-800 border-red-300'
                      }`}
                    >
                      <span>{stockLabel}</span>
                    </span>
                  )}

                  {vendorName && (
                    <span className="text-xs font-mono text-zinc-600 flex items-center gap-1">
                      <Store className="h-3.5 w-3.5 text-zinc-400" />
                      <span>{vendorName}</span>
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="font-serif text-2xl sm:text-3xl font-normal text-zinc-950 tracking-tight leading-snug mb-3">
                  {title}
                </h1>

                {/* Rate Panel */}
                <div className="p-4 rounded border border-[#E4DDCF] bg-[#FAF8F3] mb-5 flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-zinc-500">
                      OFFICIAL COUNTER RATE
                    </span>
                    <div className="text-2xl font-mono font-bold text-zinc-950 tracking-tight mt-0.5">
                      {formatPrice(price)}
                    </div>
                  </div>
                  <span className="text-xs font-mono font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Verified Campus Listing
                  </span>
                </div>

                {/* Item Description */}
                <div className="mb-5">
                  <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 mb-1.5">
                    Item Description &amp; Specifications
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed font-sans">
                    {description || 'Official campus supplies prepared for direct counter handover.'}
                  </p>
                </div>

                {/* Domain Specific Attributes */}
                {canteenDetail && (
                  <div className="p-3.5 rounded border border-amber-200 bg-amber-50/50 mb-5 text-xs font-mono space-y-1.5 text-zinc-800">
                    <p className="font-bold uppercase tracking-wider text-[10px] text-amber-900">Kitchen Preparation</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>Prep Interval: <strong>{canteenDetail.prep_time_minutes || 10} mins</strong></div>
                      <div>Dietary: <strong>{canteenDetail.is_vegetarian ? 'Vegetarian' : 'Standard'}</strong></div>
                    </div>
                  </div>
                )}

                {stationeryDetail && (
                  <div className="p-3.5 rounded border border-sky-200 bg-sky-50/50 mb-5 text-xs font-mono space-y-1.5 text-zinc-800">
                    <p className="font-bold uppercase tracking-wider text-[10px] text-sky-900">Stationery Depot Info</p>
                    <div className="grid grid-cols-2 gap-2">
                      {stationeryDetail.brand && <div>Brand: <strong>{stationeryDetail.brand}</strong></div>}
                      {stationeryDetail.paper_type && <div>Format: <strong>{stationeryDetail.paper_type}</strong></div>}
                    </div>
                  </div>
                )}

                {hostelSupplyDetail && (
                  <div className="p-3.5 rounded border border-emerald-200 bg-emerald-50/50 mb-5 text-xs font-mono space-y-1 text-zinc-800">
                    <p className="font-bold uppercase tracking-wider text-[10px] text-emerald-900">Residence Hall Logistics</p>
                    <p className="text-zinc-600 font-sans text-xs">This equipment is officially registered and requires warden verification upon checkout.</p>
                  </div>
                )}

                {bookDetail && (
                  <div className="p-3.5 rounded border border-purple-200 bg-purple-50/50 mb-5 text-xs font-mono space-y-1.5 text-zinc-800">
                    <p className="font-bold uppercase tracking-wider text-[10px] text-purple-900">Textbook Details</p>
                    <div className="grid grid-cols-2 gap-2">
                      {bookDetail.edition && <div>Edition: <strong>{bookDetail.edition}</strong></div>}
                      {bookDetail.condition && <div>Condition: <strong className="capitalize">{bookDetail.condition}</strong></div>}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-5 border-t border-[#E4DDCF] space-y-2">
                {isAuthenticated && user?.role !== 'student' ? (
                  <div className="space-y-1.5">
                    <Button
                      disabled
                      size="lg"
                      className="w-full py-2.5 rounded bg-zinc-100 text-zinc-400 font-semibold border border-[#E4DDCF] cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="h-4 w-4 opacity-40" />
                      <span>Add to Campus Cart</span>
                    </Button>
                    <p className="text-center text-xs font-mono text-amber-800 bg-amber-50 py-1.5 px-3 rounded border border-amber-200">
                      Ordering Reserved for Students (Staff Inspection Mode)
                    </p>
                  </div>
                ) : categoryType === 'book' || categoryType === 'books' ? (
                  <Button
                    onClick={() => navigate(`/books/${id}`)}
                    variant="primary"
                    size="lg"
                    className="w-full py-3 rounded text-sm font-semibold bg-purple-900 hover:bg-purple-800 text-white flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>Reserve Used Textbook (Student Handoff) ➜</span>
                  </Button>
                ) : isPurchasable ? (
                  <Button
                    onClick={handleAddToCart}
                    loading={addToCartLoading}
                    variant="primary"
                    size="lg"
                    className="w-full py-3 rounded text-sm font-semibold flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>Add to Active Cart Slip</span>
                  </Button>
                ) : (
                  <Button disabled size="lg" className="w-full py-2.5 rounded bg-zinc-200 text-zinc-500 font-medium">
                    Currently Out of Stock
                  </Button>
                )}

                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 px-1 pt-1">
                  <span>Direct counter collection</span>
                  <span>Instant 4-digit verification PIN</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="bg-white rounded-lg border border-[#E4DDCF] p-6 sm:p-8 shadow-xs">
          <ReviewSection listingId={id} />
        </div>
      </div>
    </div>
  );
}
