import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const footerSections = [
    {
      title: 'Services',
      links: [
        { label: 'Flights', href: '/flights' },
        { label: 'Hotels', href: '/hotels' },
        { label: 'Itineraries', href: '/itinerary-hub' },
        { label: 'Packages', href: '/packages' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Help & Contact', href: '/contact' },
        { label: 'Travel Blog', href: '/blog' },
        { label: 'Legal', href: '/legal' },
        { label: 'Privacy Policy', href: '/privacy' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: '/about' },
        { label: 'Careers', href: '/careers' },
        { label: 'Press', href: '/press' },
        { label: 'Partners', href: '/partners' },
      ],
    },
  ];

  return (
    <footer className="bg-primary-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center mb-4">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                TravelAI
              </span>
            </Link>
            <p className="text-primary-300 mb-6">
              Turn your travel dreams into reality with AI-powered trip planning.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              <a
                href="#"
                className="w-10 h-10 bg-primary-800 rounded-lg flex items-center justify-center hover:bg-primary-700 transition-colors"
              >
                <span className="text-sm">📘</span>
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-primary-800 rounded-lg flex items-center justify-center hover:bg-primary-700 transition-colors"
              >
                <span className="text-sm">🐦</span>
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-primary-800 rounded-lg flex items-center justify-center hover:bg-primary-700 transition-colors"
              >
                <span className="text-sm">📷</span>
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-primary-800 rounded-lg flex items-center justify-center hover:bg-primary-700 transition-colors"
              >
                <span className="text-sm">💼</span>
              </a>
            </div>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-primary-300 hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="border-t border-primary-800 mt-12 pt-8">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="mb-4 lg:mb-0">
              <h3 className="text-lg font-semibold mb-2">Stay Updated</h3>
              <p className="text-primary-300">
                Get the latest travel deals and destination insights
              </p>
            </div>
            
            <form className="flex w-full lg:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 lg:w-64 px-4 py-2 bg-primary-800 border border-primary-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-primary focus:border-transparent text-white placeholder-primary-400"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-blue-governor to-blue-ocean text-white rounded-r-lg hover:shadow-lg transition-all duration-200"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-800 mt-8 pt-8 flex flex-col lg:flex-row items-center justify-between">
          <p className="text-primary-400 text-sm mb-4 lg:mb-0">
            © 2024 TravelAI. All rights reserved.
          </p>
          
          <div className="flex items-center space-x-6 text-sm text-primary-400">
            <Link to="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/cookies" className="hover:text-white transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;