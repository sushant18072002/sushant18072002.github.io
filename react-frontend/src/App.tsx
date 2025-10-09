import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import TripsHubPage from '@/pages/TripsHubPage';
import TripDetailsPage from '@/pages/TripDetailsPage';
import TripDetailsPageEnhanced from '@/pages/TripDetailsPageEnhanced';
import { TripCustomizationPage } from '@/features/trips/TripCustomizationPage';
// import TripCustomizationPage from '@/pages/TripCustomizationPage'; // Legacy
import AIItineraryPage from '@/pages/AIItineraryPage';
import CustomBuilderPage from '@/pages/CustomBuilderPage';
import SearchResultsPage from '@/pages/SearchResultsPage';
import AdminPage from '@/pages/AdminPage';
import BlogPage from '@/pages/BlogPage';
import BlogArticlePage from '@/pages/BlogArticlePage';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import LegalPage from '@/pages/LegalPage';
import NotFoundPage from '@/pages/NotFoundPage';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AuthPage from '@/pages/AuthPage';
import DashboardPage from '@/pages/DashboardPage';
import MyTripsPage from '@/pages/MyTripsPage';
import BookingPage from '@/pages/BookingPage';
import TripBookingPage from '@/pages/TripBookingPage';
import TripsHubPageRedesigned from '@/pages/TripsHubPageRedesigned';
import CorporateBookingPage from '@/pages/CorporateBookingPage';
import CorporateDashboardPage from '@/pages/CorporateDashboardPage';
import CorporateSetupPage from '@/pages/CorporateSetupPage';
import CorporateBookingSimplePage from '@/pages/CorporateBookingSimplePage';
import BookingConfirmationPage from '@/pages/BookingConfirmationPage';

// Store
import { useAuthStore } from '@/store/authStore';

// Styles
import '@/styles/globals.css';
import '@/types/trip.types.ts';

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
              <Route path="/trips" element={<TripsHubPage />} />
              <Route path="/tripsold" element={<TripsHubPageRedesigned />} />
              <Route path="/tripsold/:id" element={<TripDetailsPage />} />
              <Route path="/trips/:id" element={<TripDetailsPageEnhanced />} />
              <Route path="/trips/:id/customize" element={<TripCustomizationPage />} />
              <Route path="/ai-itinerary" element={<AIItineraryPage />} />
              <Route path="/itineraries/ai" element={<AIItineraryPage />} />
              <Route path="/custom-builder" element={<CustomBuilderPage />} />
              
              {/* Legacy redirects */}
              <Route path="/itinerary-hub" element={<Navigate to="/trips" replace />} />
              <Route path="/itinerary-hub/:id" element={<Navigate to="/trips" replace />} />
              <Route path="/packages" element={<Navigate to="/trips" replace />} />
              <Route path="/packages/:id" element={<Navigate to="/trips" replace />} />
              <Route path="/itinerary-details" element={<TripsHubPage />} />
              <Route path="/destination/:id" element={<TripsHubPage />} />
              <Route path="/booking/:type/:id" element={
                <ProtectedRoute>
                  <BookingPage />
                </ProtectedRoute>
              } />
              <Route path="/trip-booking/:id" element={
                <ProtectedRoute>
                  <TripBookingPage />
                </ProtectedRoute>
              } />
              
              {/* Corporate Routes */}
              <Route path="/corporate/booking/:type/:id" element={
                <ProtectedRoute>
                  <CorporateBookingPage />
                </ProtectedRoute>
              } />
              <Route path="/corporate/dashboard" element={
                <ProtectedRoute>
                  <CorporateDashboardPage />
                </ProtectedRoute>
              } />
              <Route path="/corporate/setup" element={
                <ProtectedRoute>
                  <CorporateSetupPage />
                </ProtectedRoute>
              } />
              <Route path="/corporate-booking/:type/:id" element={
                <ProtectedRoute>
                  <CorporateBookingSimplePage />
                </ProtectedRoute>
              } />
              <Route path="/booking-confirmation" element={
                <ProtectedRoute>
                  <BookingConfirmationPage />
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

              {/* <Route path="/auth" element={<AuthPage />} /> */}
              
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