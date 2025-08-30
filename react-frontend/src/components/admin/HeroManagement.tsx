import React, { useState, useEffect } from 'react';
import { apiService } from '@/services/api.service';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';

const HeroManagement: React.FC = () => {
  const [heroData, setHeroData] = useState({
    heroTitle: '',
    heroSubtitle: '',
    heroImages: [''],
    heroVideo: '',
    heroVideoMuted: true,
    currentImageIndex: 0
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadHeroData();
  }, []);

  const loadHeroData = async () => {
    try {
      const response = await apiService.get('/home/featured');
      if (response.success) {
        setHeroData({
          heroTitle: response.data.heroTitle || 'Air, sleep, dream',
          heroSubtitle: response.data.heroSubtitle || 'Find and book a great experience.',
          heroImages: response.data.heroImages || [response.data.heroImage || ''],
          heroVideo: response.data.heroVideo || '',
          heroVideoMuted: response.data.heroVideoMuted !== false,
          currentImageIndex: response.data.currentImageIndex || 0
        });
      }
    } catch (error) {
      console.error('Failed to load hero data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await apiService.put('/admin/home/content', { hero: heroData });
      if (response.success) {
        alert('Hero content updated successfully!');
      }
    } catch (error) {
      console.error('Failed to save hero data:', error);
      alert('Failed to save hero content');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-8">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-primary-900 mb-2">🎬 Hero Content Management</h3>
        <p className="text-primary-600">Configure your homepage hero section</p>
      </div>

      <Card className="p-8 shadow-lg">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-primary-900 border-b pb-2">Content Settings</h4>
            
            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-3">🎨 Hero Title</label>
              <input
                type="text"
                value={heroData.heroTitle}
                onChange={(e) => setHeroData(prev => ({ ...prev, heroTitle: e.target.value }))}
                className="w-full px-4 py-3 border border-primary-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Air, sleep, dream"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-3">📝 Hero Subtitle</label>
              <textarea
                value={heroData.heroSubtitle}
                onChange={(e) => setHeroData(prev => ({ ...prev, heroSubtitle: e.target.value }))}
                className="w-full px-4 py-3 border border-primary-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                placeholder="Find and book a great experience."
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-3">🖼️ Background Images</label>
              <div className="space-y-3">
                {heroData.heroImages.map((image, index) => (
                  <div key={index} className="flex gap-3 items-center">
                    <div className="flex-1">
                      <input
                        type="url"
                        value={image}
                        onChange={(e) => {
                          const newImages = [...heroData.heroImages];
                          newImages[index] = e.target.value;
                          setHeroData(prev => ({ ...prev, heroImages: newImages }));
                        }}
                        className="w-full px-4 py-3 border border-primary-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="https://images.unsplash.com/..."
                      />
                    </div>
                    {heroData.heroImages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = heroData.heroImages.filter((_, i) => i !== index);
                          setHeroData(prev => ({ ...prev, heroImages: newImages }));
                        }}
                        className="px-3 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                        title="Remove image"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setHeroData(prev => ({ ...prev, heroImages: [...prev.heroImages, ''] }))}
                  className="w-full px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium"
                >
                  ➕ Add Image
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-3">🎥 Background Video (Optional)</label>
              <input
                type="url"
                value={heroData.heroVideo}
                onChange={(e) => setHeroData(prev => ({ ...prev, heroVideo: e.target.value }))}
                className="w-full px-4 py-3 border border-primary-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="https://example.com/video.mp4"
              />
              <p className="text-xs text-primary-500 mt-2">💡 Video will override images if provided</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-3">🔇 Video Audio</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="videoMuted"
                    checked={heroData.heroVideoMuted}
                    onChange={() => setHeroData(prev => ({ ...prev, heroVideoMuted: true }))}
                    className="mr-2"
                  />
                  <span className="text-sm">Muted (Recommended)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="videoMuted"
                    checked={!heroData.heroVideoMuted}
                    onChange={() => setHeroData(prev => ({ ...prev, heroVideoMuted: false }))}
                    className="mr-2"
                  />
                  <span className="text-sm">With Sound</span>
                </label>
              </div>
            </div>

            <div className="pt-4">
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="w-full py-3 text-lg font-semibold"
              >
                {saving ? '🔄 Saving...' : '💾 Save Hero Content'}
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-primary-900 border-b pb-2">🔍 Live Preview</h4>
            
            <div className="relative h-80 rounded-2xl overflow-hidden shadow-lg">
              {heroData.heroVideo ? (
                <video
                  src={heroData.heroVideo}
                  className="w-full h-full object-cover"
                  muted={heroData.heroVideoMuted}
                  loop
                  autoPlay
                />
              ) : (
                <img
                  src={heroData.heroImages[0] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=400&fit=crop'}
                  alt="Hero preview"
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/30 to-black/50 flex items-center justify-center">
                <div className="text-center text-white px-6">
                  <h1 className="text-4xl font-bold mb-4 drop-shadow-lg">{heroData.heroTitle || 'Your Hero Title'}</h1>
                  <p className="text-xl opacity-90 drop-shadow">{heroData.heroSubtitle || 'Your hero subtitle will appear here'}</p>
                  <div className="mt-6">
                    <button className="bg-blue-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-600 transition-colors">
                      Start your search
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center text-sm text-primary-500">
              💡 This is how your hero section will look on the homepage
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default HeroManagement;