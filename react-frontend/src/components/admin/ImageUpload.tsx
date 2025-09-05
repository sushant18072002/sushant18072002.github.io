import React, { useState } from 'react';
import Button from '@/components/common/Button';
import { API_CONFIG } from '@/config/api.config';
import { APP_CONSTANTS } from '@/constants/app.constants';

interface ImageUploadProps {
  images?: any[];
  onImagesChange?: (images: any[]) => void;
  onImagesUploaded?: (images: any[]) => void;
  maxImages?: number;
  category?: string;
  packageId?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  images = [], 
  onImagesChange, 
  onImagesUploaded,
  maxImages = APP_CONSTANTS.MAX_IMAGES || 10, 
  category = 'general',
  packageId
}) => {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    if (images.length + e.target.files.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    setUploading(true);
    
    const formData = new FormData();
    Array.from(e.target.files).forEach((file, index) => {
      formData.append('images', file);
      formData.append(`alt_${index}`, `${category} image ${images.length + index + 1}`);
      formData.append(`category_${index}`, category);
    });
    
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.UPLOAD_MULTIPLE}`, {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data.images) {
          const newImages = [...images, ...result.data.images];
          onImagesChange?.(newImages);
          onImagesUploaded?.(result.data.images);
        }
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (index: number) => {
    const imageToRemove = images[index];
    
    try {
      // Delete from server
      await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.UPLOAD_DELETE(imageToRemove.filename)}`, {
        method: 'DELETE'
      });
      
      // Remove from state
      const newImages = images.filter((_, i) => i !== index);
      onImagesChange?.(newImages);
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  };

  const updateImageDetails = (index: number, field: string, value: any) => {
    const newImages = [...images];
    newImages[index] = { ...newImages[index], [field]: value };
    onImagesChange?.(newImages);
  };

  const setPrimaryImage = (index: number) => {
    const newImages = images.map((img, i) => ({
      ...img,
      isPrimary: i === index
    }));
    onImagesChange?.(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="border-2 border-dashed border-primary-300 rounded-lg p-6 text-center">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileUpload}
          disabled={uploading || images.length >= maxImages}
          className="hidden"
          id="image-upload"
        />
        <label 
          htmlFor="image-upload" 
          className={`cursor-pointer ${uploading || images.length >= maxImages ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="text-4xl mb-2">📸</div>
          <div className="text-lg font-medium text-primary-900 mb-2">
            {uploading ? 'Uploading...' : 'Upload Images'}
          </div>
          <div className="text-sm text-primary-600">
            Click to select images or drag and drop
          </div>
          <div className="text-xs text-primary-500 mt-1">
            {images.length}/{maxImages} images • Max 5MB per image
          </div>
        </label>
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative border border-primary-200 rounded-lg overflow-hidden">
              {/* Image */}
              <div className="relative aspect-video">
                <img
                  src={image.url.startsWith('http') ? image.url : `${API_CONFIG.BASE_URL.replace('/api', '')}${image.url}`}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                />
                
                {/* Primary Badge */}
                {image.isPrimary && (
                  <div className="absolute top-2 left-2 bg-blue-ocean text-white px-2 py-1 rounded text-xs font-bold">
                    Primary
                  </div>
                )}
                
                {/* Actions */}
                <div className="absolute top-2 right-2 flex gap-1">
                  {!image.isPrimary && (
                    <button
                      onClick={() => setPrimaryImage(index)}
                      className="bg-white bg-opacity-80 hover:bg-opacity-100 text-primary-700 p-1 rounded text-xs"
                      title="Set as primary"
                    >
                      ⭐
                    </button>
                  )}
                  <button
                    onClick={() => removeImage(index)}
                    className="bg-red-500 bg-opacity-80 hover:bg-opacity-100 text-white p-1 rounded text-xs"
                    title="Remove image"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              {/* Image Details */}
              <div className="p-3 space-y-2">
                <div>
                  <label className="block text-xs font-medium text-primary-700 mb-1">Alt Text</label>
                  <input
                    type="text"
                    value={image.alt}
                    onChange={(e) => updateImageDetails(index, 'alt', e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-primary-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-ocean"
                    placeholder="Describe this image"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-primary-700 mb-1">Category</label>
                  <select
                    value={image.category || 'other'}
                    onChange={(e) => updateImageDetails(index, 'category', e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-primary-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-ocean"
                  >
                    <option value="trip">Trip</option>
                    <option value="destination">Destination</option>
                    <option value="activity">Activity</option>
                    <option value="accommodation">Accommodation</option>
                    <option value="food">Food</option>
                    <option value="transport">Transport</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="text-xs text-primary-500">
                  Size: {(image.size / 1024).toFixed(1)} KB
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Upload Button */}
      {images.length < maxImages && (
        <Button
          type="button"
          variant="outline"
          onClick={() => document.getElementById('image-upload')?.click()}
          disabled={uploading}
          className="w-full"
        >
          {uploading ? 'Uploading...' : `Add More Images (${images.length}/${maxImages})`}
        </Button>
      )}
    </div>
  );
};

export default ImageUpload;