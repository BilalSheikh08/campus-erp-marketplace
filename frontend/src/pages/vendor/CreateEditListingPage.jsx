/**
 * Create/Edit listing page - vendors can create and modify listings.
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { createListing, updateListing, fetchListingDetail } from '../../api/listings';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/shared/Alert';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';

const CATEGORIES = [
  { value: 'canteen', label: 'Canteen' },
  { value: 'stationery', label: 'Stationery' },
  { value: 'hostel_supply', label: 'Hostel Supply' },
  { value: 'book', label: 'Book' },
];

const CATEGORY_FIELDS = {
  canteen: ['prep_time_minutes', 'is_vegetarian', 'contains_nuts'],
  stationery: ['brand', 'quantity_per_unit', 'color'],
  hostel_supply: ['color', 'size', 'material'],
  book: ['author', 'subject', 'edition', 'condition'],
};

export default function CreateEditListingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const isEdit = Boolean(id);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    category_type: 'canteen',
    price: '',
    description: '',
    status: 'active',
    // Category-specific fields
    prep_time_minutes: '',
    is_vegetarian: false,
    contains_nuts: false,
    brand: '',
    quantity_per_unit: '',
    color: '',
    size: '',
    material: '',
    author: '',
    subject: '',
    edition: '',
    condition: 'good',
  });

  useEffect(() => {
    if (isEdit) {
      loadListing();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadListing = async () => {
    try {
      const data = await fetchListingDetail(id);
      setFormData(prev => ({
        ...prev,
        ...data,
      }));
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load listing');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      // Build submit data based on category
      const submitData = {
        title: formData.title,
        category_type: formData.category_type,
        price: parseFloat(formData.price),
        description: formData.description,
        status: formData.status,
      };

      // Add category-specific detail fields
      const detailKey = `${formData.category_type}_detail`;
      const detailData = {};

      CATEGORY_FIELDS[formData.category_type]?.forEach(field => {
        if (formData[field] !== undefined && formData[field] !== '') {
          detailData[field] = formData[field];
        }
      });

      if (Object.keys(detailData).length > 0) {
        submitData[detailKey] = detailData;
      }

      if (isEdit) {
        await updateListing(id, submitData);
        setSuccessMessage('Listing updated successfully');
      } else {
        await createListing(submitData);
        setSuccessMessage('Listing created successfully');
      }

      setTimeout(() => navigate('/vendor/listings'), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save listing');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user || user.role !== 'vendor') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Alert type="error" message="Access denied. Vendors only." />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading listing..." />;
  }

  const categoryFields = CATEGORY_FIELDS[formData.category_type] || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => navigate('/vendor/listings')}
            className="p-2 hover:bg-gray-200 rounded-lg transition"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEdit ? 'Edit Listing' : 'Create Listing'}
            </h1>
          </div>
        </div>

        {error && (
          <div className="mb-6">
            <Alert type="error" message={error} dismissible onClose={() => setError(null)} />
          </div>
        )}

        {successMessage && (
          <div className="mb-6">
            <Alert type="success" message={successMessage} dismissible onClose={() => setSuccessMessage(null)} />
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="border-b pb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>

              <Input
                label="Product Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter product name"
                required
              />

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category_type"
                    value={formData.category_type}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Price (₹)"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your product..."
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Category-Specific Fields */}
            {categoryFields.length > 0 && (
              <div className="border-b pb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {CATEGORIES.find(c => c.value === formData.category_type)?.label} Details
                </h2>

                <div className="space-y-4">
                  {formData.category_type === 'canteen' && (
                    <>
                      <Input
                        label="Preparation Time (minutes)"
                        name="prep_time_minutes"
                        type="number"
                        value={formData.prep_time_minutes}
                        onChange={handleChange}
                      />
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="is_vegetarian"
                          checked={formData.is_vegetarian}
                          onChange={handleChange}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700">Vegetarian</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="contains_nuts"
                          checked={formData.contains_nuts}
                          onChange={handleChange}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700">Contains Nuts</span>
                      </label>
                    </>
                  )}

                  {formData.category_type === 'stationery' && (
                    <>
                      <Input
                        label="Brand"
                        name="brand"
                        value={formData.brand}
                        onChange={handleChange}
                      />
                      <Input
                        label="Quantity Per Unit"
                        name="quantity_per_unit"
                        value={formData.quantity_per_unit}
                        onChange={handleChange}
                      />
                      <Input
                        label="Color"
                        name="color"
                        value={formData.color}
                        onChange={handleChange}
                      />
                    </>
                  )}

                  {formData.category_type === 'hostel_supply' && (
                    <>
                      <Input
                        label="Color"
                        name="color"
                        value={formData.color}
                        onChange={handleChange}
                      />
                      <Input
                        label="Size"
                        name="size"
                        value={formData.size}
                        onChange={handleChange}
                      />
                      <Input
                        label="Material"
                        name="material"
                        value={formData.material}
                        onChange={handleChange}
                      />
                    </>
                  )}

                  {formData.category_type === 'book' && (
                    <>
                      <Input
                        label="Author"
                        name="author"
                        value={formData.author}
                        onChange={handleChange}
                      />
                      <Input
                        label="Subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                      />
                      <Input
                        label="Edition"
                        name="edition"
                        value={formData.edition}
                        onChange={handleChange}
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Condition
                        </label>
                        <select
                          name="condition"
                          value={formData.condition}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="like_new">Like New</option>
                          <option value="good">Good</option>
                          <option value="fair">Fair</option>
                          <option value="poor">Poor</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={isSaving}
                className="flex-1"
              >
                {isSaving ? 'Saving...' : isEdit ? 'Update Listing' : 'Create Listing'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/vendor/listings')}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
