/**
 * Authentication layout - for login and register pages.
 * No navbar/footer, full focus on the authentication form.
 */

import PropTypes from 'prop-types';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#F8F6F0] text-zinc-900 flex flex-col justify-center">
      {children}
    </div>
  );
}

AuthLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
