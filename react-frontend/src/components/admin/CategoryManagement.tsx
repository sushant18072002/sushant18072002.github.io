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
  parentCategory?: Category;
  type: string;
  order: number;
  status: string;
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
    description: '',
    icon: '',
    color: '#3B82F6',
    parentCategory: '',
    type: 'trip',
    order: 0,
    status: 'active'
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
        parentCategory: formData.parentCategory || undefined
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
      description: category.description,
      icon: category.icon,
      color: category.color,
      parentCategory: category.parentCategory?._id || '',
      type: category.type,
      order: category.order,
      status: category.status
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      icon: '',
      color: '#3B82F6',
      parentCategory: '',
      type: 'trip',
      order: 0,
      status: 'active'
    });
    setEditingCategory(null);
    setShowForm(false);
  };

  const parentCategories = categories.filter(cat => !cat.parentCategory);

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
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
              >
                <option value="trip">Trip</option>
                <option value="activity">Activity</option>
                <option value="accommodation">Accommodation</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">Parent Category</label>
              <select
                value={formData.parentCategory}
                onChange={(e) => setFormData(prev => ({ ...prev, parentCategory: e.target.value }))}
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
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

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
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                        {category.type}
                      </span>
                      {category.parentCategory && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          Child of: {category.parentCategory.name}
                        </span>
                      )}
                      <span className={`text-xs px-2 py-1 rounded ${
                        category.status === 'active' ? 'bg-emerald/20 text-emerald' : 'bg-red-100 text-red-700'
                      }`}>
                        {category.status}
                      </span>
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