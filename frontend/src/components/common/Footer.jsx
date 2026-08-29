/**
 * Application footer component.
 */

import { Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              Campus ERP
            </h3>
            <p className="text-sm">
              A unified marketplace for campus commerce supporting canteen, stationery,
              hostel supplies, and second-hand books.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-primary transition">Home</a></li>
              <li><a href="#" className="hover:text-primary transition">Browse Catalog</a></li>
              <li><a href="#" className="hover:text-primary transition">Become a Vendor</a></li>
              <li><a href="#" className="hover:text-primary transition">Contact Us</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <a href="mailto:support@campuserp.local" className="hover:text-primary transition">
                  support@campuserp.local
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+91 XXXX XXXX XX</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p>&copy; 2026 Campus ERP Marketplace. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
