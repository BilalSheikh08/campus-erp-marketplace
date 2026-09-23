/**
 * Price formatting utility.
 */

export const formatPrice = (price) => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return `₹${numPrice.toFixed(2)}`;
};

/**
 * Format date to readable string.
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Capitalize string.
 */
export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Get domain label.
 */
export const getDomainLabel = (domain) => {
  const labels = {
    canteen: '🍽️ Canteen',
    stationery: '📚 Stationery',
    hostel_supply: '🏠 Hostel Supplies',
    book: '📖 Used Books',
  };
  return labels[domain] || domain;
};

/**
 * Get stock status label.
 */
export const getStockStatusLabel = (status) => {
  const labels = {
    in_stock: 'In Stock',
    low_stock: 'Low Stock',
    out_of_stock: 'Out of Stock',
  };
  return labels[status] || status;
};
