/**
 * Campus Commons - 404 / Coming Soon State
 */

import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Button from '../components/shared/Button';
import { ArrowLeft, Compass } from 'lucide-react';

export default function ComingSoonPage({
  title = 'Page Under Development',
  message = 'This campus service or route is being prepared for upcoming terms.',
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-16 text-slate-900">
      <div className="text-center max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-200">
          <Compass className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">{title}</h1>
        <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">{message}</p>
        <Link to="/">
          <Button variant="blue" className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold shadow-xs">
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Campus Hub</span>
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
