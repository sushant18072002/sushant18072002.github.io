import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';

const ContactPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const form = useForm();

  const categories = [
    { id: 'planning', icon: '🗺️', title: 'Trip Planning', desc: 'Questions about destinations, itineraries, or travel advice' },
    { id: 'booking', icon: '💳', title: 'Booking & Payments', desc: 'Help with reservations, payments, or booking changes' },
    { id: 'technical', icon: '⚙️', title: 'Technical Support', desc: 'Issues with our AI, website, or mobile app' },
    { id: 'emergency', icon: '🚨', title: 'Travel Emergency', desc: 'Urgent help needed during your trip' }
  ];

  const handleSubmit = (data: any) => {
    console.log('Contact form submitted:', data);
    // Handle form submission
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-50 to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-blue-ocean text-white px-4 py-2 rounded-full text-sm font-bold inline-block mb-4">
            🤝 We're Here to Help
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-primary-900 mb-4">
            What can we help you with?
          </h1>
          <p className="text-xl text-primary-600 mb-8">
            Choose your topic for faster, more personalized support
          </p>
          <div className="flex justify-center gap-8 text-center">
            {[
              { number: '< 2 min', label: 'Response Time' },
              { number: '24/7', label: 'Available' },
              { number: '98%', label: 'Resolved' }
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-2xl font-bold text-primary-900">{stat.number}</div>
                <div className="text-sm text-primary-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {!selectedCategory && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category) => (
                <Card
                  key={category.id}
                  className="p-6 cursor-pointer hover:shadow-xl transition-all text-center"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <div className="text-4xl mb-4">{category.icon}</div>
                  <h3 className="text-xl font-bold text-primary-900 mb-3">{category.title}</h3>
                  <p className="text-primary-600 text-sm">{category.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Form */}
      {selectedCategory && (
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <button
                onClick={() => setSelectedCategory(null)}
                className="flex items-center gap-2 text-primary-600 hover:text-primary-900 transition-colors"
              >
                <span>←</span>
                <span>Back to Categories</span>
              </button>
            </div>

            <Card className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-primary-900 mb-2">Get Help</h2>
                <p className="text-primary-600">Our travel experts will respond within 2 minutes</p>
              </div>

              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-primary-900 mb-2">Your Name</label>
                    <input
                      {...form.register('name', { required: true })}
                      className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-primary-900 mb-2">Email Address</label>
                    <input
                      {...form.register('email', { required: true })}
                      type="email"
                      className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-primary-900 mb-2">Subject</label>
                  <input
                    {...form.register('subject', { required: true })}
                    className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                    placeholder="Brief description of your question"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-primary-900 mb-2">Message</label>
                  <textarea
                    {...form.register('message', { required: true })}
                    rows={5}
                    className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent resize-none"
                    placeholder="The more details you provide, the better we can help you..."
                  />
                </div>

                <Button type="submit" fullWidth size="lg">
                  Send Message
                </Button>
              </form>
            </Card>
          </div>
        </section>
      )}

      {/* Alternative Contact Methods */}
      <section className="py-16 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-900 mb-4">Other ways to reach us</h2>
            <p className="text-primary-600">Choose the method that works best for you</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '💬', title: 'Live Chat', desc: 'Instant help from our travel experts', status: 'Available now', action: 'Start Chat' },
              { icon: '📞', title: 'Phone Support', desc: 'Speak directly with a travel advisor', status: '+1 (555) 123-TRIP', action: 'Call Now' },
              { icon: '📱', title: 'WhatsApp', desc: 'Quick messages and photo sharing', status: 'Perfect for screenshots', action: 'Message Us' }
            ].map((method, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{method.icon}</div>
                <h3 className="text-xl font-bold text-primary-900 mb-3">{method.title}</h3>
                <p className="text-primary-600 mb-4">{method.desc}</p>
                <div className="text-sm text-primary-500 mb-4">{method.status}</div>
                <Button variant="outline" fullWidth>{method.action}</Button>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;