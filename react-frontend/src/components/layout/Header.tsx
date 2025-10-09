import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/common/Button';
import AuthModal from '@/components/auth/AuthModal';
import { notificationService, Notification } from '@/services/notification.service';
import { APP_CONSTANTS } from '@/constants/app.constants';

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [notifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/flights', label: 'Flights' },
    { href: '/hotels', label: 'Hotels' },
    { href: '/trips', label: 'Trips' },
    { href: '/blog', label: 'Blog' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-primary-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img 
              src={APP_CONSTANTS.LOGO_PATH} 
              alt={APP_CONSTANTS.APP_NAME}
              className="h-10 w-auto"
            />
            <img 
              src={APP_CONSTANTS.LOGO_TEXT_PATH} 
              alt={APP_CONSTANTS.APP_NAME}
              className="h-8 w-auto"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                if (nextElement) {
                  nextElement.style.display = 'inline';
                }
              }}
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-governor to-blue-mirage bg-clip-text text-transparent hidden">
              {APP_CONSTANTS.APP_NAME}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium transition-colors duration-200 ${
                  location.pathname === link.href
                    ? 'text-blue-governor'
                    : 'text-primary-700 hover:text-blue-governor'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden lg:flex items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search destinations, hotels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 border border-primary-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-primary focus:border-transparent"
              />
            </div>
          </form>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <div className="relative">
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-primary-600 hover:text-blue-governor transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                    {notifications.filter(n => !n.read).length > 0 && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                    )}
                  </button>
                  
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-primary-200 z-50">
                      <div className="p-4 border-b border-primary-200">
                        <div className="flex justify-between items-center">
                          <h3 className="font-semibold text-primary-900">Notifications</h3>
                          <button 
                            onClick={() => notificationService.markAllAsRead()}
                            className="text-sm text-blue-ocean hover:underline"
                          >
                            Mark all read
                          </button>
                        </div>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-primary-500">
                            No notifications
                          </div>
                        ) : (
                          notifications.slice(0, 5).map(notification => (
                            <div 
                              key={notification.id} 
                              className={`p-4 border-b border-primary-100 hover:bg-primary-50 cursor-pointer ${
                                !notification.read ? 'bg-blue-50' : ''
                              }`}
                              onClick={() => {
                                if (notification.actionUrl) navigate(notification.actionUrl);
                                notificationService.markAsRead(notification.id);
                              }}
                            >
                              <div className="font-semibold text-primary-900 text-sm">{notification.title}</div>
                              <div className="text-primary-600 text-xs mt-1">{notification.message}</div>
                              <div className="text-primary-400 text-xs mt-1">
                                {new Date(notification.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Menu */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-primary-100 transition-colors">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-governor to-blue-mirage rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </div>
                    <span className="hidden md:block text-sm font-medium text-primary-700">
                      {user?.firstName}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-primary-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-2">
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-sm text-primary-700 hover:bg-primary-50"
                      >
                        Dashboard
                      </Link>
                      {/* <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-primary-700 hover:bg-primary-50"
                      >
                        Profile
                      </Link>
                      <Link
                        to="/bookings"
                        className="block px-4 py-2 text-sm text-primary-700 hover:bg-primary-50"
                      >
                        My Bookings
                      </Link> */}
                      
                      {user?.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-sm text-primary-700 hover:bg-primary-50 font-semibold"
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <hr className="my-2 border-primary-200" />
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-primary-700 hover:bg-primary-50"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
                  size="sm"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}
                  size="sm"
                >
                  Sign Up
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-primary-600 hover:text-blue-governor transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-primary-200 py-4">
            <nav className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-base font-medium transition-colors duration-200 ${
                    location.pathname === link.href
                      ? 'text-blue-governor'
                      : 'text-primary-700 hover:text-blue-governor'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="pt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search destinations, hotels..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-primary focus:border-transparent"
                  />
                </div>
              </form>
            </nav>
          </div>
        )}
      </div>
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </header>
  );
};

export default Header;