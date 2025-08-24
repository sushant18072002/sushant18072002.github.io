import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminService, BlogPost } from '@/services/admin.service';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const BlogArticlePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  const samplePost: BlogPost = {
    id: '1',
    title: 'Best Travel Destinations for 2024',
    slug: 'best-travel-destinations-2024',
    excerpt: 'Discover the most amazing places to visit this year',
    content: `# Best Travel Destinations for 2024

Planning your next adventure? 2024 offers incredible opportunities to explore both emerging destinations and beloved classics with a fresh perspective.

## 1. Japan - Cherry Blossom Season

Japan continues to captivate travelers with its perfect blend of ancient traditions and cutting-edge modernity. The cherry blossom season (March-May) offers magical experiences across the country.

### What to Expect:
- Stunning sakura blooms in Tokyo and Kyoto
- Traditional ryokan experiences
- World-class cuisine and hospitality
- Efficient transportation system

## 2. Portugal - Hidden European Gem

Portugal offers incredible value and authentic European charm without the crowds of more popular destinations.

### Highlights:
- Colorful Porto architecture
- Lisbon's vibrant neighborhoods
- Stunning Algarve coastline
- Delicious seafood and wine

## 3. New Zealand - Adventure Capital

For thrill-seekers and nature lovers, New Zealand remains unmatched in its natural beauty and adventure activities.

### Must-Do Activities:
- Bungee jumping in Queenstown
- Milford Sound cruises
- Hobbiton movie set tours
- Glacier hiking

## Planning Your Trip

When planning your 2024 adventure, consider:
- Booking early for better prices
- Travel insurance for peace of mind
- Local customs and etiquette
- Sustainable tourism practices

Ready to start planning? Our AI-powered trip planner can help you create the perfect itinerary for any of these amazing destinations.`,
    author: 'Travel Expert',
    status: 'published',
    publishDate: '2024-01-15',
    tags: ['destinations', 'travel', '2024'],
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=400&fit=crop'
  };

  useEffect(() => {
    if (slug) {
      loadBlogPost();
    }
  }, [slug]);

  const loadBlogPost = async () => {
    try {
      // In real app, fetch by slug
      setPost(samplePost);
    } catch (error) {
      setPost(samplePost);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary-900 mb-4">Article not found</h2>
          <Button onClick={() => navigate('/blog')}>Back to Blog</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-primary-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/blog')}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-900 transition-colors mb-6"
          >
            <span>←</span>
            <span>Back to Blog</span>
          </button>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-primary-500 mb-4">
              <span>By {post.author}</span>
              <span>•</span>
              <span>{new Date(post.publishDate).toLocaleDateString()}</span>
              <span>•</span>
              <span>8 min read</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-primary-900 mb-4">
              {post.title}
            </h1>
            
            <p className="text-xl text-primary-600 mb-6">
              {post.excerpt}
            </p>
            
            <div className="flex flex-wrap justify-center gap-2">
              {post.tags.map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-blue-ocean text-white rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      <section className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-64 md:h-96 object-cover rounded-xl"
          />
        </div>
      </section>

      {/* Article Content */}
      <section className="pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <div className="whitespace-pre-line text-primary-700 leading-relaxed">
              {post.content.split('\n').map((paragraph, index) => {
                if (paragraph.startsWith('# ')) {
                  return <h1 key={index} className="text-3xl font-bold text-primary-900 mt-8 mb-4">{paragraph.slice(2)}</h1>;
                }
                if (paragraph.startsWith('## ')) {
                  return <h2 key={index} className="text-2xl font-bold text-primary-900 mt-6 mb-3">{paragraph.slice(3)}</h2>;
                }
                if (paragraph.startsWith('### ')) {
                  return <h3 key={index} className="text-xl font-bold text-primary-900 mt-4 mb-2">{paragraph.slice(4)}</h3>;
                }
                if (paragraph.startsWith('- ')) {
                  return <li key={index} className="ml-4 mb-1">{paragraph.slice(2)}</li>;
                }
                if (paragraph.trim() === '') {
                  return <br key={index} />;
                }
                return <p key={index} className="mb-4">{paragraph}</p>;
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      <section className="py-16 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-primary-900 text-center mb-8">Related Articles</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'How to Plan the Perfect Itinerary',
                excerpt: 'Step-by-step guide to creating unforgettable travel experiences',
                image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=250&fit=crop',
                slug: 'how-to-plan-perfect-itinerary'
              },
              {
                title: 'Budget Travel Tips and Tricks',
                excerpt: 'Smart strategies to travel the world without breaking the bank',
                image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=250&fit=crop',
                slug: 'budget-travel-tips'
              },
              {
                title: 'Top 10 Luxury Hotels Worldwide',
                excerpt: 'Experience the pinnacle of hospitality at these extraordinary hotels',
                image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=250&fit=crop',
                slug: 'top-luxury-hotels-worldwide'
              }
            ].map((article, index) => (
              <Card
                key={index}
                className="cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => navigate(`/blog/${article.slug}`)}
              >
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className="p-6">
                  <h3 className="text-lg font-bold text-primary-900 mb-2">{article.title}</h3>
                  <p className="text-primary-600 text-sm">{article.excerpt}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Plan Your Trip?</h2>
          <p className="text-primary-300 mb-8">
            Use our AI-powered trip planner to create your perfect itinerary
          </p>
          <Button
            size="lg"
            className="bg-blue-ocean hover:bg-blue-700"
            onClick={() => navigate('/ai-itinerary')}
          >
            Start Planning Now
          </Button>
        </div>
      </section>
    </div>
  );
};

export default BlogArticlePage;