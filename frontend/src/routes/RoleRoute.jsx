/**
 * RoleRoute component - wraps routes requiring specific roles.
 * Redirects to home if user lacks required role.
 */

import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import useAuthStore from '../store/authStore';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function RoleRoute({ requiredRole, children }) {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingSpinner message="Initializing..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== requiredRole) {
    const roleHomes = {
      vendor: '/vendor/dashboard',
      warden: '/warden/dashboard',
      admin: '/admin/dashboard',
      student: '/',
    };
    const userHome = roleHomes[user?.role] || '/';
    return (
      <Navigate
        to={userHome}
        replace
        state={{ error: `Access restricted. This section requires ${requiredRole} privileges.` }}
      />
    );
  }

  return children;
}

RoleRoute.propTypes = {
  requiredRole: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};
