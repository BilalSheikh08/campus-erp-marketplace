/**
 * Authentication layout - for login and register pages.
 * No navbar/footer, full focus on the authentication form.
 */

import PropTypes from 'prop-types';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {children}
    </div>
  );
}

AuthLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
