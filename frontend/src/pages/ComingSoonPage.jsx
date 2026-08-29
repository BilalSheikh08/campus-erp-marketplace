/**
 * Placeholder page component for future development.
 */

import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Button from '../components/shared/Button';
import { ArrowLeft } from 'lucide-react';

export default function ComingSoonPage({ title = 'Page', message = 'This page is coming soon.' }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-xl text-gray-600 mb-8">{message}</p>
        <Link to="/">
          <Button className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}

ComingSoonPage.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
};
