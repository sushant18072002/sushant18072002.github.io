import React, { useState, useRef } from 'react';
import Button from '@/components/common/Button';

interface ImageUploadProps {
  packageId: string;
  onImagesUploaded: (images: any[]) => void;
  maxImages?: number;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  packageId, 
  onImagesUploaded, 
  maxImages = 10 
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList) => {
    if (files.length === 0) return;

    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('images', file);
    });

    setUploading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/admin/packages/${packageId}/images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        onImagesUploaded(result.data.images);
      } else {
        alert('Failed to upload images: ' + (result.error?.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-blue-ocean bg-blue-50' 
            : 'border-primary-300 hover:border-primary-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="space-y-4">
          <div className="text-4xl">📸</div>
          <div>
            <h3 className="text-lg font-semibold text-primary-900 mb-2">
              Upload Package Images
            </h3>
            <p className="text-primary-600 mb-4">
              Drag and drop images here, or click to select files
            </p>
            <p className="text-sm text-primary-500">
              Supports: JPG, PNG, WebP • Max {maxImages} images • Max 5MB each
            </p>
          </div>
          
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            variant="outline"
          >
            {uploading ? 'Uploading...' : 'Select Images'}
          </Button>
        </div>
      </div>

      {uploading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-ocean"></div>
          <span className="ml-2 text-primary-600">Uploading images...</span>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;