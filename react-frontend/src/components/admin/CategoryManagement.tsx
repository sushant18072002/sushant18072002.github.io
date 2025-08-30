import React, { useState, useEffect } from 'react';
import { masterDataService } from '@/services/masterData.service';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  parent?: Category;
  children?: Category[];
  type: 'flight' | 'hotel' | 'trip' | 'activity' | 'general' | 'adventure';
  metadata?: {
    flightSpecific?: {
      cabinClass?: 'economy' | 'premium-economy' | 'business' | 'first';
      serviceLevel?: 'basic' | 'standard' | 'premium' | 'luxury';
    };
    hotelSpecific?: {
      starRating?: number;
      propertyType?: 'hotel' | 'resort' | 'apartment' | 'villa' | 'hostel';
    };
    adventureSpecific?: {
      places?: string;
      difficulty?: 'easy' | 'moderate' | 'challenging' | 'extreme';
    };
  };
  active: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    color: '#3B82F6',
    parent: '',
    type: 'trip' as Category['type'],
    active: true,
    order: 0,
    metadata: {
      flightSpecific: {
        cabinClass: '' as any,
        serviceLevel: '' as any
      },
      hotelSpecific: {
        starRating: 0,
        propertyType: '' as any
      },
      adventureSpecific: {
        places: '',
        difficulty: '' as any
      }
    }
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await masterDataService.getAdminCategories();
      setCategories(response.categories || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        parent: formData.parent || undefined,
        metadata: {
          ...(formData.type === 'flight' && formData.metadata.flightSpecific.cabinClass && {
            flightSpecific: formData.metadata.flightSpecific
          }),
          ...(formData.type === 'hotel' && formData.metadata.hotelSpecific.starRating && {
            hotelSpecific: formData.metadata.hotelSpecific
          }),
          ...(formData.type === 'adventure' && formData.metadata.adventureSpecific.places && {
            adventureSpecific: formData.metadata.adventureSpecific
          })
        }
      };

      if (editingCategory) {
        await masterDataService.updateCategory(editingCategory._id, payload);
      } else {
        await masterDataService.createCategory(payload);
      }
      loadCategories();
      resetForm();
    } catch (error) {
      console.error('Failed to save category:', error);
      alert('Failed to save category');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      icon: category.icon || '',
      color: category.color || '#3B82F6',
      parent: category.parent?._id || '',
      type: category.type,
      active: category.active,
      order: category.order,
      metadata: {
        flightSpecific: {
          cabinClass: category.metadata?.flightSpecific?.cabinClass || '' as any,
          serviceLevel: category.metadata?.flightSpecific?.serviceLevel || '' as any
        },
        hotelSpecific: {
          starRating: category.metadata?.hotelSpecific?.starRating || 0,
          propertyType: category.metadata?.hotelSpecific?.propertyType || '' as any
        },
        adventureSpecific: {
          places: category.metadata?.adventureSpecific?.places || '',
          difficulty: category.metadata?.adventureSpecific?.difficulty || '' as any
        }
      }
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      icon: '',
      color: '#3B82F6',
      parent: '',
      type: 'trip',
      active: true,
      order: 0,
      metadata: {
        flightSpecific: {
          cabinClass: '' as any,
          serviceLevel: '' as any
        },
        hotelSpecific: {
          starRating: 0,
          propertyType: '' as any
        },
        adventureSpecific: {
          places: '',
          difficulty: '' as any
        }
      }
    });
    setEditingCategory(null);
    setShowForm(false);
  };

  const parentCategories = categories.filter(cat => !cat.parent);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-primary-900">Categories</h3>
          <p className="text-primary-600">Manage trip and activity categories</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          + Add Category
        </Button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-bold text-primary-900">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h4>
            <Button variant="outline" onClick={resetForm}>Cancel</Button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">Category Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                placeholder="auto-generated from name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">Icon (Emoji)</label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                placeholder="🏔️"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-primary-900 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="w-12 h-10 border border-primary-200 rounded-lg"
                />
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Category['type'] }))}
                className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
              >
                <option value="flight">Flight</option>
                <option value="hotel">Hotel</option>
                <option value="trip">Trip</option>
                <option value="activity">Activity</option>
                <option value="general">General</option>
                <option value="adventure">Adventure</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">Parent Category</label>
              <select
                value={formData.parent}
                onChange={(e) => setFormData(prev => ({ ...prev, parent: e.target.value }))}
                className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
              >
                <option value="">None (Top Level)</option>
                {parentCategories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">Order</label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">Status</label>
              <select
                value={formData.active ? 'active' : 'inactive'}
                onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.value === 'active' }))}
                className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Type-specific metadata fields */}
            {formData.type === 'flight' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-primary-900 mb-2">Cabin Class</label>
                  <select
                    value={formData.metadata.flightSpecific.cabinClass}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        flightSpecific: {
                          ...prev.metadata.flightSpecific,
                          cabinClass: e.target.value as any
                        }
                      }
                    }))}
                    className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                  >
                    <option value="">Select cabin class</option>
                    <option value="economy">Economy</option>
                    <option value="premium-economy">Premium Economy</option>
                    <option value="business">Business</option>
                    <option value="first">First Class</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary-900 mb-2">Service Level</label>
                  <select
                    value={formData.metadata.flightSpecific.serviceLevel}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        flightSpecific: {
                          ...prev.metadata.flightSpecific,
                          serviceLevel: e.target.value as any
                        }
                      }
                    }))}
                    className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                  >
                    <option value="">Select service level</option>
                    <option value="basic">Basic</option>
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                    <option value="luxury">Luxury</option>
                  </select>
                </div>
              </>
            )}

            {formData.type === 'hotel' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-primary-900 mb-2">Star Rating</label>
                  <select
                    value={formData.metadata.hotelSpecific.starRating}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        hotelSpecific: {
                          ...prev.metadata.hotelSpecific,
                          starRating: parseInt(e.target.value) || 0
                        }
                      }
                    }))}
                    className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                  >
                    <option value="0">Select star rating</option>
                    <option value="1">1 Star</option>
                    <option value="2">2 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="5">5 Stars</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary-900 mb-2">Property Type</label>
                  <select
                    value={formData.metadata.hotelSpecific.propertyType}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        hotelSpecific: {
                          ...prev.metadata.hotelSpecific,
                          propertyType: e.target.value as any
                        }
                      }
                    }))}
                    className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                  >
                    <option value="">Select property type</option>
                    <option value="hotel">Hotel</option>
                    <option value="resort">Resort</option>
                    <option value="apartment">Apartment</option>
                    <option value="villa">Villa</option>
                    <option value="hostel">Hostel</option>
                  </select>
                </div>
              </>
            )}

            {formData.type === 'adventure' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-primary-900 mb-2">Places Count</label>
                  <input
                    type="text"
                    value={formData.metadata.adventureSpecific.places}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        adventureSpecific: {
                          ...prev.metadata.adventureSpecific,
                          places: e.target.value
                        }
                      }
                    }))}
                    className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                    placeholder="e.g., 50+ Places"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary-900 mb-2">Difficulty Level</label>
                  <select
                    value={formData.metadata.adventureSpecific.difficulty}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        adventureSpecific: {
                          ...prev.metadata.adventureSpecific,
                          difficulty: e.target.value as any
                        }
                      }
                    }))}
                    className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                  >
                    <option value="">Select difficulty</option>
                    <option value="easy">Easy</option>
                    <option value="moderate">Moderate</option>
                    <option value="challenging">Challenging</option>
                    <option value="extreme">Extreme</option>
                  </select>
                </div>
              </>
            )}

            <div className="md:col-span-2">
              <Button type="submit" className="w-full">
                {editingCategory ? 'Update Category' : 'Create Category'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Categories List */}
      <Card className="p-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="space-y-4">
            {categories.map(category => (
              <div
                key={category._id}
                className="flex items-center justify-between p-4 border border-primary-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl"
                    style={{ backgroundColor: category.color }}
                  >
                    {category.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary-900">{category.name}</h4>
                    <p className="text-sm text-primary-600">{category.description}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                        {category.type}
                      </span>
                      {category.parent && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          Child of: {category.parent.name}
                        </span>
                      )}
                      <span className={`text-xs px-2 py-1 rounded ${
                        category.active ? 'bg-emerald/20 text-emerald' : 'bg-red-100 text-red-700'
                      }`}>
                        {category.active ? 'Active' : 'Inactive'}
                      </span>
                      {category.slug && (
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          /{category.slug}
                        </span>
                      )}
                      {category.metadata?.adventureSpecific?.places && (
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                          {category.metadata.adventureSpecific.places}
                        </span>
                      )}
                      {category.metadata?.hotelSpecific?.starRating && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                          {category.metadata.hotelSpecific.starRating} ⭐
                        </span>
                      )}
                      {category.metadata?.flightSpecific?.cabinClass && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                          {category.metadata.flightSpecific.cabinClass}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(category)}>
                    Edit
                  </Button>
                </div>
              </div>
            ))}

            {categories.length === 0 && (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🏷️</div>
                <h3 className="text-xl font-semibold text-primary-900 mb-2">No categories found</h3>
                <p className="text-primary-600 mb-4">Add your first category to get started</p>
                <Button onClick={() => setShowForm(true)}>Add Category</Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default CategoryManagement;