import React, { useState } from 'react';

const LegalPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('terms');

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-primary-50 py-8 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setActiveTab('terms')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === 'terms'
                  ? 'bg-blue-ocean text-white'
                  : 'bg-white text-primary-700 hover:bg-primary-100'
              }`}
            >
              Terms & Conditions
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === 'privacy'
                  ? 'bg-blue-ocean text-white'
                  : 'bg-white text-primary-700 hover:bg-primary-100'
              }`}
            >
              Privacy Policy
            </button>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {activeTab === 'terms' && (
            <div className="prose prose-lg max-w-none">
              <h1 className="text-4xl font-bold text-primary-900 mb-4">Terms & Conditions</h1>
              <p className="text-primary-500 mb-8">Last updated: December 15, 2024</p>
              
              <h2 className="text-2xl font-bold text-primary-900 mt-8 mb-4">1. Acceptance of Terms</h2>
              <p className="text-primary-700 mb-6">
                By accessing and using TravelAI's services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
              
              <h2 className="text-2xl font-bold text-primary-900 mt-8 mb-4">2. Service Description</h2>
              <p className="text-primary-700 mb-4">TravelAI provides AI-powered travel planning services, including:</p>
              <ul className="list-disc pl-6 text-primary-700 mb-6">
                <li>Personalized itinerary generation using artificial intelligence</li>
                <li>Travel booking assistance and coordination</li>
                <li>Custom trip planning through guided questionnaires</li>
                <li>Pre-designed travel packages and experiences</li>
              </ul>
              
              <h2 className="text-2xl font-bold text-primary-900 mt-8 mb-4">3. User Responsibilities</h2>
              <p className="text-primary-700 mb-4">Users are responsible for:</p>
              <ul className="list-disc pl-6 text-primary-700 mb-6">
                <li>Providing accurate information for travel planning</li>
                <li>Reviewing all travel details before booking</li>
                <li>Maintaining valid travel documents (passport, visa, etc.)</li>
                <li>Understanding cancellation policies of service providers</li>
              </ul>
              
              <h2 className="text-2xl font-bold text-primary-900 mt-8 mb-4">4. Booking and Payment Terms</h2>
              <p className="text-primary-700 mb-6">
                All bookings are subject to availability and confirmation by service providers. Payment is required at the time of booking unless otherwise specified. Prices are subject to change until payment is completed.
              </p>
              
              <h2 className="text-2xl font-bold text-primary-900 mt-8 mb-4">5. Limitation of Liability</h2>
              <p className="text-primary-700 mb-6">
                TravelAI is not liable for any direct, indirect, incidental, or consequential damages arising from the use of our services or any travel-related issues beyond our control, including but not limited to flight delays, weather conditions, or service provider changes.
              </p>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="prose prose-lg max-w-none">
              <h1 className="text-4xl font-bold text-primary-900 mb-4">Privacy Policy</h1>
              <p className="text-primary-500 mb-8">Last updated: December 15, 2024</p>
              
              <h2 className="text-2xl font-bold text-primary-900 mt-8 mb-4">1. Information We Collect</h2>
              <p className="text-primary-700 mb-4">We collect information you provide directly to us, such as:</p>
              <ul className="list-disc pl-6 text-primary-700 mb-6">
                <li>Personal information (name, email, phone number)</li>
                <li>Travel preferences and history</li>
                <li>Payment information (processed securely by third parties)</li>
                <li>Communication records with our support team</li>
              </ul>
              
              <h2 className="text-2xl font-bold text-primary-900 mt-8 mb-4">2. How We Use Your Information</h2>
              <p className="text-primary-700 mb-4">We use your information to:</p>
              <ul className="list-disc pl-6 text-primary-700 mb-6">
                <li>Provide personalized travel recommendations</li>
                <li>Process bookings and payments</li>
                <li>Communicate about your trips and our services</li>
                <li>Improve our AI algorithms and user experience</li>
                <li>Comply with legal obligations</li>
              </ul>
              
              <h2 className="text-2xl font-bold text-primary-900 mt-8 mb-4">3. Data Security</h2>
              <p className="text-primary-700 mb-4">We implement industry-standard security measures including:</p>
              <ul className="list-disc pl-6 text-primary-700 mb-6">
                <li>256-bit SSL encryption for data transmission</li>
                <li>Secure data storage with regular backups</li>
                <li>Regular security audits and updates</li>
                <li>Limited access to personal information by employees</li>
              </ul>
              
              <h2 className="text-2xl font-bold text-primary-900 mt-8 mb-4">4. Your Rights</h2>
              <p className="text-primary-700 mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 text-primary-700 mb-6">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Delete your account and associated data</li>
                <li>Export your data in a portable format</li>
                <li>Opt out of marketing communications</li>
              </ul>
              
              <h2 className="text-2xl font-bold text-primary-900 mt-8 mb-4">5. Contact Us</h2>
              <p className="text-primary-700 mb-4">For privacy-related questions or requests, contact us at:</p>
              <ul className="list-disc pl-6 text-primary-700 mb-6">
                <li>Email: privacy@travelai.com</li>
                <li>Phone: +1 (555) 123-TRIP</li>
                <li>Data Protection Officer: dpo@travelai.com</li>
              </ul>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default LegalPage;