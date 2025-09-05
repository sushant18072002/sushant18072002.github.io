import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import { APP_CONSTANTS } from '@/constants/app.constants';

const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-governor to-blue-mirage text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Revolutionizing Travel with AI
          </h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
            We're on a mission to make travel planning effortless, personalized, and unforgettable for everyone.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-primary-900 mb-6">🎯 Our Mission</h2>
          <p className="text-xl text-primary-600 leading-relaxed">
            At {APP_CONSTANTS.APP_NAME}, we believe that every journey should be as unique as the traveler. {APP_CONSTANTS.APP_DESCRIPTION} by combining cutting-edge technology with human expertise to create personalized travel experiences that exceed expectations.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-primary-900 text-center mb-12">💎 Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: '🤖', title: 'AI-Powered Innovation', desc: 'We leverage artificial intelligence to understand your preferences and create perfectly tailored travel experiences.' },
              { icon: '🌍', title: 'Global Accessibility', desc: 'Making travel accessible to everyone, everywhere, with transparent pricing and inclusive experiences.' },
              { icon: '🛡️', title: 'Trust & Security', desc: 'Your safety and privacy are paramount. We maintain the highest standards of security and transparency.' },
              { icon: '⚡', title: 'Seamless Experience', desc: 'From planning to booking to traveling, we ensure every step is smooth and enjoyable.' }
            ].map((value, index) => (
              <Card key={index} className="p-8 text-center hover:shadow-xl transition-shadow">
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold text-primary-900 mb-4">{value.title}</h3>
                <p className="text-primary-600">{value.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-primary-900 text-center mb-12">👥 Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Alex Chen', role: 'CEO & Founder', bio: 'Former Google AI researcher with 10+ years in travel tech. Passionate about making travel accessible through technology.', avatar: '👨‍💼' },
              { name: 'Sarah Johnson', role: 'CTO', bio: 'AI and machine learning expert who previously led engineering teams at Airbnb and Expedia.', avatar: '👩‍💻' },
              { name: 'Marcus Rodriguez', role: 'Head of Design', bio: 'Award-winning UX designer focused on creating intuitive and delightful travel experiences.', avatar: '👨‍🎨' }
            ].map((member, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-xl transition-shadow">
                <div className="h-64 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-6xl">
                  {member.avatar}
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-bold text-primary-900 mb-2">{member.name}</h3>
                  <p className="text-blue-ocean font-semibold mb-4">{member.role}</p>
                  <p className="text-primary-600 text-sm">{member.bio}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">📊 Our Impact</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: '500K+', label: 'Happy Travelers' },
              { number: '200+', label: 'Countries Covered' },
              { number: '1M+', label: 'Trips Planned' },
              { number: '4.9★', label: 'Average Rating' }
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-4xl font-bold text-amber-premium mb-2">{stat.number}</div>
                <div className="text-lg opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary-50 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-primary-900 mb-4">Ready to Start Your Journey?</h2>
          <p className="text-xl text-primary-600 mb-8">Join thousands of travelers who trust {APP_CONSTANTS.APP_NAME} for their perfect trips</p>
          <Button size="lg" onClick={() => navigate('/')}>
            Start Planning Today
          </Button>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;