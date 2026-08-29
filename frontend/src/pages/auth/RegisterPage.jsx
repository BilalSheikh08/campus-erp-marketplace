/**
 * Register page - allows new students to create an account.
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import Alert from '../../components/shared/Alert';
import { VALIDATION_RULES } from '../../utils/constants';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    passwordConfirmation: '',
    phone: '',
    hostelRoom: '',
  });

  const [validationErrors, setValidationErrors] = useState({});

  const validateForm = () => {
    const errors = {};

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!VALIDATION_RULES.EMAIL_PATTERN.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
      errors.password = `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters`;
    }

    if (!formData.passwordConfirmation) {
      errors.passwordConfirmation = 'Please confirm your password';
    } else if (formData.password !== formData.passwordConfirmation) {
      errors.passwordConfirmation = 'Passwords do not match';
    }

    if (formData.phone && !VALIDATION_RULES.PHONE_PATTERN.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      await register(
        formData.email.toLowerCase().trim(),
        formData.name.trim(),
        formData.password,
        formData.passwordConfirmation,
        formData.phone.trim(),
        formData.hostelRoom.trim(),
      );
      navigate('/');
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">C</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Get Started
          </h1>
          <p className="text-gray-600">
            Create your Campus ERP account
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4">
            <Alert
              type="error"
              message={error}
              onClose={clearError}
              dismissible
            />
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={handleChange}
            error={validationErrors.email}
            disabled={isLoading}
            required
          />

          <Input
            label="Full Name"
            type="text"
            name="name"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            error={validationErrors.name}
            disabled={isLoading}
            required
          />

          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            error={validationErrors.password}
            disabled={isLoading}
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            name="passwordConfirmation"
            placeholder="••••••••"
            value={formData.passwordConfirmation}
            onChange={handleChange}
            error={validationErrors.passwordConfirmation}
            disabled={isLoading}
            required
          />

          <Input
            label="Phone (Optional)"
            type="tel"
            name="phone"
            placeholder="+91 XXXXX XXXXX"
            value={formData.phone}
            onChange={handleChange}
            error={validationErrors.phone}
            disabled={isLoading}
          />

          <Input
            label="Hostel Room (Optional)"
            type="text"
            name="hostelRoom"
            placeholder="A-101"
            value={formData.hostelRoom}
            onChange={handleChange}
            disabled={isLoading}
          />

          <Button
            type="submit"
            loading={isLoading}
            disabled={isLoading}
            className="w-full"
          >
            Create Account
          </Button>
        </form>

        {/* Footer */}
        <p className="text-center mt-6 text-gray-600 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
