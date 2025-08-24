import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Layout Components
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// Pages
import HomePage from '@/pages/HomePage';
import FlightsPage from '@/pages/FlightsPage';
import FlightDetailsPage from '@/pages/FlightDetailsPage';
import HotelsPage from '@/pages/HotelsPage';
import HotelDetailsPage from '@/pages/HotelDetailsPage';
import ItineraryHubPage from '@/pages/ItineraryHubPage';
import ItineraryDetailsPage from '@/pages/ItineraryDetailsPage';
import AIItineraryPage from '@/pages/AIItineraryPage';
import CustomBuilderPage from '@/pages/CustomBuilderPage';
import PackageDetailsPage from '@/pages/PackageDetailsPage';
import SearchResultsPage from '@/pages/SearchResultsPage';
import AdminPage from '@/pages/AdminPage';
import BlogPage from '@/pages/BlogPage';
import BlogArticlePage from '@/pages/BlogArticlePage';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import LegalPage from '@/pages/LegalPage';
import NotFoundPage from '@/pages/NotFoundPage';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import PackagesPage from '@/pages/PackagesPage';
import AuthPage from '@/pages/AuthPage';
import DashboardPage from '@/pages/DashboardPage';
import BookingPage from '@/pages/BookingPage';

// Store
import { useAuthStore } from '@/store/authStore';

// Styles
import '@/styles/globals.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    // Initialize auth state from localStorage
    initializeAuth();
  }, [initializeAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-primary-50 flex flex-col">
          <Header />
          
          <main className="flex-1 pt-16">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/flights" element={<FlightsPage />} />
              <Route path="/flights/:id" element={<FlightDetailsPage />} />
              <Route path="/hotels" element={<HotelsPage />} />
              <Route path="/hotels/:id" element={<HotelDetailsPage />} />
              <Route path="/itinerary-hub" element={<ItineraryHubPage />} />
              <Route path="/itinerary-hub/:id" element={<ItineraryDetailsPage />} />
              <Route path="/ai-itinerary" element={<AIItineraryPage />} />
              <Route path="/custom-builder" element={<CustomBuilderPage />} />
              <Route path="/booking/:type/:id" element={
                <ProtectedRoute>
                  <BookingPage />
                </ProtectedRoute>
              } />
              <Route path="/search" element={<SearchResultsPage />} />
              <Route path="/admin" element={
                <ProtectedRoute adminOnly>
                  <AdminPage />
                </ProtectedRoute>
              } />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogArticlePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/legal" element={<LegalPage />} />
              <Route path="*" element={<NotFoundPage />} />
              <Route path="/packages" element={<PackagesPage />} />
              <Route path="/packages/:id" element={<PackageDetailsPage />} />
              <Route path="/auth" element={<AuthPage />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } />
              <Route path="/booking" element={<BookingPage />} />
              
              {/* Catch all route */}
              <Route path="*" element={<div className="flex items-center justify-center min-h-screen"><h1 className="text-2xl font-bold text-primary-900">Page Not Found</h1></div>} />
            </Routes>
          </main>
          
          <Footer />
        </div>
        
        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#1e293b',
              border: '1px solid #e2e8f0',
              borderRadius: '0.75rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            },
          }}
        />
      </Router>
    </QueryClientProvider>
  );
}

export default App;