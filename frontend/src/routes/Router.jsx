/**
 * Main application router with all routes and navigation.
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthStore from '../store/authStore';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

// Pages
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ComingSoonPage from '../pages/ComingSoonPage';
import LoadingSpinner from '../components/common/LoadingSpinner';
import MarketplaceLandingPage from '../pages/marketplace/MarketplaceLandingPage';
import CatalogPage from '../pages/marketplace/CatalogPage';
import ListingDetailPage from '../pages/marketplace/ListingDetailPage';
import CartPage from '../pages/CartPage';
import OrdersPage from '../pages/OrdersPage';
import OrderDetailPage from '../pages/OrderDetailPage';
import ProfilePage from '../pages/ProfilePage';
import VendorDashboard from '../pages/vendor/VendorDashboard';
import VendorListings from '../pages/vendor/VendorListings';
import VendorInventory from '../pages/vendor/VendorInventory';
import InventoryAdjustmentPage from '../pages/vendor/InventoryAdjustmentPage';
import CreateEditListingPage from '../pages/vendor/CreateEditListingPage';
import VendorApplicationPage from '../pages/VendorApplicationPage';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminVendorApprovalDashboard from '../pages/admin/AdminVendorApprovalDashboard';
import AdminOrders from '../pages/admin/AdminOrders';
import AdminListings from '../pages/admin/AdminListings';
import StudentHostelRequests from '../pages/student/StudentHostelRequests';
import WardenDashboard from '../pages/warden/WardenDashboard';
import WardenRequestsManagement from '../pages/warden/WardenRequestsManagement';
import WardenHostelRequestDetail from '../pages/warden/WardenHostelRequestDetail';

export default function Router() {
  const { isLoading, initializeAuth } = useAuthStore();

  // Initialize authentication on app load
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (isLoading) {
    return <LoadingSpinner message="Loading application..." />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <AuthLayout>
              <LoginPage />
            </AuthLayout>
          }
        />
        <Route
          path="/register"
          element={
            <AuthLayout>
              <RegisterPage />
            </AuthLayout>
          }
        />

        {/* Home Page - works for both authenticated and unauthenticated */}
        <Route
          path="/"
          element={
            <MainLayout>
              <HomePage />
            </MainLayout>
          }
        />

        {/* Protected Routes - Student */}
        <Route
          path="/profile"
          element={
            <MainLayout>
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            </MainLayout>
          }
        />

        {/* Marketplace Routes */}
        <Route
          path="/marketplace"
          element={
            <MainLayout>
              <ProtectedRoute>
                <MarketplaceLandingPage />
              </ProtectedRoute>
            </MainLayout>
          }
        />
        <Route
          path="/marketplace/:domain"
          element={
            <MainLayout>
              <ProtectedRoute>
                <CatalogPage />
              </ProtectedRoute>
            </MainLayout>
          }
        />
        <Route
          path="/listings/:id"
          element={
            <MainLayout>
              <ProtectedRoute>
                <ListingDetailPage />
              </ProtectedRoute>
            </MainLayout>
          }
        />
        <Route
          path="/cart"
          element={
            <MainLayout>
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            </MainLayout>
          }
        />
        <Route
          path="/orders"
          element={
            <MainLayout>
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            </MainLayout>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <MainLayout>
              <ProtectedRoute>
                <OrderDetailPage />
              </ProtectedRoute>
            </MainLayout>
          }
        />

        {/* Protected Routes - Vendor */}
        <Route
          path="/vendor/dashboard"
          element={
            <MainLayout>
              <RoleRoute requiredRole="vendor">
                <VendorDashboard />
              </RoleRoute>
            </MainLayout>
          }
        />
        <Route
          path="/vendor/listings"
          element={
            <MainLayout>
              <RoleRoute requiredRole="vendor">
                <VendorListings />
              </RoleRoute>
            </MainLayout>
          }
        />
        <Route
          path="/vendor/listings/new"
          element={
            <MainLayout>
              <RoleRoute requiredRole="vendor">
                <CreateEditListingPage />
              </RoleRoute>
            </MainLayout>
          }
        />
        <Route
          path="/vendor/listings/:id/edit"
          element={
            <MainLayout>
              <RoleRoute requiredRole="vendor">
                <CreateEditListingPage />
              </RoleRoute>
            </MainLayout>
          }
        />
        <Route
          path="/vendor/inventory"
          element={
            <MainLayout>
              <RoleRoute requiredRole="vendor">
                <VendorInventory />
              </RoleRoute>
            </MainLayout>
          }
        />
        <Route
          path="/vendor/inventory/:id/adjust"
          element={
            <MainLayout>
              <RoleRoute requiredRole="vendor">
                <InventoryAdjustmentPage />
              </RoleRoute>
            </MainLayout>
          }
        />

        {/* Vendor Application */}
        <Route
          path="/become-vendor"
          element={
            <MainLayout>
              <ProtectedRoute>
                <VendorApplicationPage />
              </ProtectedRoute>
            </MainLayout>
          }
        />

        {/* Protected Routes - Admin */}
        <Route
          path="/admin/dashboard"
          element={
            <MainLayout>
              <RoleRoute requiredRole="admin">
                <AdminDashboard />
              </RoleRoute>
            </MainLayout>
          }
        />
        <Route
          path="/admin/vendors"
          element={
            <MainLayout>
              <RoleRoute requiredRole="admin">
                <AdminVendorApprovalDashboard />
              </RoleRoute>
            </MainLayout>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <MainLayout>
              <RoleRoute requiredRole="admin">
                <AdminOrders />
              </RoleRoute>
            </MainLayout>
          }
        />
        <Route
          path="/admin/listings"
          element={
            <MainLayout>
              <RoleRoute requiredRole="admin">
                <AdminListings />
              </RoleRoute>
            </MainLayout>
          }
        />

        {/* Protected Routes - Student: Hostel Requests */}
        <Route
          path="/hostel-requests"
          element={
            <MainLayout>
              <ProtectedRoute>
                <StudentHostelRequests />
              </ProtectedRoute>
            </MainLayout>
          }
        />

        {/* Protected Routes - Warden */}
        <Route
          path="/warden/dashboard"
          element={
            <MainLayout>
              <RoleRoute requiredRole="warden">
                <WardenDashboard />
              </RoleRoute>
            </MainLayout>
          }
        />
        <Route
          path="/warden/requests"
          element={
            <MainLayout>
              <RoleRoute requiredRole="warden">
                <WardenRequestsManagement />
              </RoleRoute>
            </MainLayout>
          }
        />
        <Route
          path="/warden/requests/:id"
          element={
            <MainLayout>
              <RoleRoute requiredRole="warden">
                <WardenHostelRequestDetail />
              </RoleRoute>
            </MainLayout>
          }
        />

        {/* 404 - Not Found */}
        <Route
          path="*"
          element={
            <MainLayout>
              <ComingSoonPage title="404 - Not Found" message="This page does not exist." />
            </MainLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
