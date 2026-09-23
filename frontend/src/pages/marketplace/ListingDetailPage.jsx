/**
 * Listing detail page - full product information.
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, BookOpen, Utensils, Package, ShoppingCart } from 'lucide-react';
import useListingsStore from '../../store/listingsStore';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/shared/Alert';
import Button from '../../components/shared/Button';
import { formatPrice, getDomainLabel, getStockStatusLabel } from '../../utils/formatters';

const DOMAIN_ICONS = {
  canteen: <Utensils className="h-6 w-6" />,
  stationery: <Package className="h-6 w-6" />,
  hostel_supply: <Package className="h-6 w-6" />,
  book: <BookOpen className="h-6 w-6" />,
};

export default function ListingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [addToCartLoading, setAddToCartLoading] = useState(false);
  const [addToCartMessage, setAddToCartMessage] = useState(null);
  const { currentListing, isLoading, error, fetchListing } =
    useListingsStore();
  const { addItem: addToCart, clearError: clearCartError } =
    useCartStore();

  useEffect(() => {
    fetchListing(id);
  }, [id, fetchListing]);

  if (isLoading) {
    return <LoadingSpinner message="Loading product..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <Alert type="error" title="Error" message={error} />
          <Button onClick={() => navigate('/marketplace')} className="mt-4">
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  if (!currentListing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Product not found.</p>
          <Button onClick={() => navigate('/marketplace')}>
            Back to Marketplace
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
      setAddToCartMessage({ type: 'success', text: 'Added to cart!' });
      setTimeout(() => setAddToCartMessage(null), 3000);
    } catch (err) {
      setAddToCartMessage({
        type: 'error',
        text: err.response?.data?.detail || 'Failed to add to cart',
      });
    } finally {
      setAddToCartLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary hover:underline mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {/* Cart messages */}
        {addToCartMessage && (
          <div className="mb-6">
            <Alert
              type={addToCartMessage.type}
              message={addToCartMessage.text}
              dismissible
              onClose={() => setAddToCartMessage(null)}
            />
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-8">
            {/* Image */}
            <div className="flex items-center justify-center bg-gray-100 rounded-lg h-96 md:h-full">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-full h-full object-cover"
                  onError={e => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="text-6xl opacity-50">{domainLabel.split(' ')[0]}</div>
              )}
            </div>

            {/* Information */}
            <div className="flex flex-col">
              {/* Category & Status */}
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                  {DOMAIN_ICONS[categoryType]}
                  {domainLabel}
                </span>
                {stockStatus && (
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      stockStatus === 'in_stock'
                        ? 'bg-green-100 text-green-800'
                        : stockStatus === 'low_stock'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {stockLabel}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>

              {/* Price */}
              <div className="mb-6 pb-6 border-b">
                <p className="text-4xl font-bold text-primary">
                  {formatPrice(price)}
                </p>
              </div>

              {/* Vendor */}
              {vendorName && (
                <div className="mb-6 pb-6 border-b">
                  <p className="text-sm text-gray-600 mb-2">Sold by</p>
                  <p className="flex items-center gap-2 font-semibold text-gray-900">
                    <MapPin className="h-4 w-4" />
                    {vendorName}
                  </p>
                </div>
              )}

              {/* Domain-Specific Details */}
              {canteenDetail && (
                <div className="mb-6 pb-6 border-b">
                  <h3 className="font-semibold text-gray-900 mb-3">Item Details</h3>
                  <dl className="space-y-2 text-sm">
                    {canteenDetail.is_veg !== undefined && (
                      <>
                        <dt className="font-medium text-gray-700">Vegetarian</dt>
                        <dd className="text-gray-600">
                          {canteenDetail.is_veg ? 'Yes' : 'No'}
                        </dd>
                      </>
                    )}
                    {canteenDetail.prep_time_minutes && (
                      <>
                        <dt className="font-medium text-gray-700">Prep Time</dt>
                        <dd className="text-gray-600">{canteenDetail.prep_time_minutes} minutes</dd>
                      </>
                    )}
                    {canteenDetail.available_from && (
                      <>
                        <dt className="font-medium text-gray-700">Available</dt>
                        <dd className="text-gray-600">
                          {canteenDetail.available_from} - {canteenDetail.available_to}
                        </dd>
                      </>
                    )}
                  </dl>
                </div>
              )}

              {stationeryDetail && (
                <div className="mb-6 pb-6 border-b">
                  <h3 className="font-semibold text-gray-900 mb-3">Product Details</h3>
                  <dl className="space-y-2 text-sm">
                    {stationeryDetail.sku && (
                      <>
                        <dt className="font-medium text-gray-700">SKU</dt>
                        <dd className="text-gray-600">{stationeryDetail.sku}</dd>
                      </>
                    )}
                    {stationeryDetail.unit && (
                      <>
                        <dt className="font-medium text-gray-700">Unit</dt>
                        <dd className="text-gray-600">{stationeryDetail.unit}</dd>
                      </>
                    )}
                  </dl>
                </div>
              )}

              {bookDetail && (
                <div className="mb-6 pb-6 border-b">
                  <h3 className="font-semibold text-gray-900 mb-3">Book Details</h3>
                  <dl className="space-y-2 text-sm">
                    {bookDetail.author && (
                      <>
                        <dt className="font-medium text-gray-700">Author</dt>
                        <dd className="text-gray-600">{bookDetail.author}</dd>
                      </>
                    )}
                    {bookDetail.subject && (
                      <>
                        <dt className="font-medium text-gray-700">Subject</dt>
                        <dd className="text-gray-600">{bookDetail.subject}</dd>
                      </>
                    )}
                    {bookDetail.edition && (
                      <>
                        <dt className="font-medium text-gray-700">Edition</dt>
                        <dd className="text-gray-600">{bookDetail.edition}</dd>
                      </>
                    )}
                    {bookDetail.condition && (
                      <>
                        <dt className="font-medium text-gray-700">Condition</dt>
                        <dd className="capitalize text-gray-600">{bookDetail.condition}</dd>
                      </>
                    )}
                  </dl>
                </div>
              )}

              {hostelSupplyDetail && (
                <div className="mb-6 pb-6 border-b">
                  <h3 className="font-semibold text-gray-900 mb-3">Supply Details</h3>
                  <dl className="space-y-2 text-sm">
                    {hostelSupplyDetail.supply_category && (
                      <>
                        <dt className="font-medium text-gray-700">Category</dt>
                        <dd className="text-gray-600">
                          {hostelSupplyDetail.supply_category}
                        </dd>
                      </>
                    )}
                    {hostelSupplyDetail.request_only && (
                      <>
                        <dt className="font-medium text-gray-700">Availability</dt>
                        <dd className="text-gray-600">Request only</dd>
                      </>
                    )}
                  </dl>
                </div>
              )}

              {/* Description */}
              {description && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{description}</p>
                </div>
              )}

              {/* Action Button */}
              <div className="mt-auto pt-6 border-t">
                {isPurchasable ? (
                  <Button
                    size="lg"
                    className="w-full flex items-center justify-center gap-2"
                    onClick={handleAddToCart}
                    disabled={addToCartLoading}
                    loading={addToCartLoading}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {addToCartLoading ? 'Adding...' : 'Add to Cart'}
                  </Button>
                ) : (
                  <Button size="lg" variant="secondary" className="w-full" disabled>
                    Not Available
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
