import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService, BlogPost } from '@/services/admin.service';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const BlogPage: React.FC = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const samplePosts: BlogPost[] = [
    {
      id: '1',
      title: 'Best Travel Destinations for 2024',
      slug: 'best-travel-destinations-2024',
      excerpt: 'Discover the most amazing places to visit this year, from hidden gems to popular hotspots.',
      content: '',
      author: 'Travel Expert',
      status: 'published',
      publishDate: '2024-01-15',
      tags: ['destinations', 'travel', '2024'],
      image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=400&fit=crop'
    },
    {
      id: '2',
      title: 'How to Plan the Perfect Itinerary',
      slug: 'how-to-plan-perfect-itinerary',
      excerpt: 'Step-by-step guide to creating unforgettable travel experiences that maximize your time and budget.',
      content: '',
      author: 'Planning Pro',
      status: 'published',
      publishDate: '2024-01-12',
      tags: ['planning', 'itinerary', 'tips'],
      image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=400&fit=crop'
    },
    {
      id: '3',
      title: 'Budget Travel: Save More, Experience More',
      slug: 'budget-travel-tips',
      excerpt: 'Smart strategies to travel the world without breaking the bank while still having amazing experiences.',
      content: '',
      author: 'Budget Guru',
      status: 'published',
      publishDate: '2024-01-10',
      tags: ['budget', 'tips', 'savings'],
      image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&h=400&fit=crop'
    },
    {
      id: '4',
      title: 'Top 10 Luxury Hotels Worldwide',
      slug: 'top-luxury-hotels-worldwide',
      excerpt: 'Experience the pinnacle of hospitality at these extraordinary luxury hotels around the globe.',
      content: '',
      author: 'Luxury Travel',
      status: 'published',
      publishDate: '2024-01-08',
      tags: ['luxury', 'hotels', 'accommodation'],
      image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&h=400&fit=crop'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Posts' },
    { id: 'destinations', name: 'Destinations' },
    { id: 'planning', name: 'Planning' },
    { id: 'budget', name: 'Budget Travel' },
    { id: 'luxury', name: 'Luxury Travel' },
    { id: 'tips', name: 'Travel Tips' }
  ];

  useEffect(() => {
    loadBlogPosts();
  }, []);

  const loadBlogPosts = async () => {
    try {
      const response = await adminService.getBlogPosts();
      setPosts(response.data.posts || samplePosts);
    } catch (error) {
      setPosts(samplePosts);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    if (selectedCategory === 'all') return true;
    return post.tags.includes(selectedCategory);
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-50 to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-900 mb-4">
            Travel Blog
          </h1>
          <p className="text-xl text-primary-600 mb-8">
            Expert advice, insider tips, and inspiration for your next adventure
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-blue-ocean text-white'
                    : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map(post => (
                <Card
                  key={post.id}
                  className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden"
                  onClick={() => navigate(`/blog/${post.slug}`)}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-blue-ocean text-white px-3 py-1 rounded-full text-xs font-bold">
                        {post.tags[0]?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-sm text-primary-500 mb-3">
                      <span>By {post.author}</span>
                      <span>•</span>
                      <span>{formatDate(post.publishDate)}</span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-primary-900 mb-3 group-hover:text-blue-ocean transition-colors">
                      {post.title}
                    </h3>
                    
                    <p className="text-primary-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-ocean font-semibold group-hover:underline">
                        Read More →
                      </span>
                      <span className="text-xs text-primary-400">5 min read</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {filteredPosts.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-bold text-primary-900 mb-2">No posts found</h3>
              <p className="text-primary-600 mb-6">Try selecting a different category</p>
              <Button onClick={() => setSelectedCategory('all')}>
                View All Posts
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-primary-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-primary-300 mb-8">
            Get the latest travel tips, destination guides, and exclusive deals delivered to your inbox
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-primary-900 focus:ring-2 focus:ring-blue-ocean focus:outline-none"
            />
            <Button className="bg-blue-ocean hover:bg-blue-700">
              Subscribe
            </Button>
          </div>
          
          <p className="text-xs text-primary-400 mt-4">
            No spam, unsubscribe at any time
          </p>
        </div>
      </section>
    </div>
  );
};

export default BlogPage;