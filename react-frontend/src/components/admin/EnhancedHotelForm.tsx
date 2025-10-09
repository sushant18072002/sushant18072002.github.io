import React, { useState, useEffect } from 'react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import API_CONFIG from '@/config/api.config';

interface EnhancedHotelFormProps {
  editingHotel?: any;
  onSave: (hotelData: any) => void;
  onCancel: () => void;
}

const EnhancedHotelForm: React.FC<EnhancedHotelFormProps> = ({ editingHotel, onSave, onCancel }) => {
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [nearbyAttractions, setNearbyAttractions] = useState<any[]>([]);
  
  const createDefaultRoom = () => ({
    id: `room-${Date.now()}`,
    name: 'Standard Room',
    type: 'standard',
    size: 35,
    maxOccupancy: 2,
    bedConfiguration: { kingBeds: 1, singleBeds: 0, doubleBeds: 0, queenBeds: 0 },
    amenities: ['WiFi', 'AC', 'Mini Bar'],
    pricing: {
      baseRate: 150,
      currency: 'USD',
      taxes: 0,
      fees: 0,
      totalRate: 150,
      cancellationPolicy: { type: 'free', deadline: 24, fee: 0 }
    },
    totalRooms: 10,
    images: []
  });
  
  const addRoom = () => setRooms([...rooms, createDefaultRoom()]);
  const removeRoom = (index: number) => setRooms(rooms.filter((_, i) => i !== index));
  const updateRoom = (index: number, field: string, value: any) => {
    const updatedRooms = [...rooms];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      updatedRooms[index][parent][child] = value;
    } else {
      updatedRooms[index][field] = value;
    }
    
    // Auto-calculate totalRate when baseRate or taxes change
    if (field === 'pricing.baseRate' || field === 'pricing.taxes') {
      const baseRate = updatedRooms[index].pricing.baseRate || 0;
      const taxes = updatedRooms[index].pricing.taxes || 0;
      const fees = updatedRooms[index].pricing.fees || 0;
      updatedRooms[index].pricing.totalRate = baseRate + taxes + fees;
    }
    
    setRooms(updatedRooms);
  };
  
  const addNearbyAttraction = () => setNearbyAttractions([...nearbyAttractions, { name: '', distance: 0, type: '' }]);
  const removeNearbyAttraction = (index: number) => setNearbyAttractions(nearbyAttractions.filter((_, i) => i !== index));
  const updateNearbyAttraction = (index: number, field: string, value: any) => {
    const updated = [...nearbyAttractions];
    updated[index][field] = value;
    setNearbyAttractions(updated);
  };
  
  useEffect(() => {
    if (editingHotel?.images) {
      const validImages = editingHotel.images.filter(img => 
        img.url && !img.url.startsWith('blob:') && img.url.trim() !== ''
      );
      setUploadedImages(validImages);
    } else {
      setUploadedImages([]);
    }
    
    if (editingHotel?.rooms && editingHotel.rooms.length > 0) {
      setRooms(editingHotel.rooms);
    } else {
      setRooms([createDefaultRoom()]);
    }
    
    if (editingHotel?.location?.nearbyAttractions && editingHotel.location.nearbyAttractions.length > 0) {
      setNearbyAttractions(editingHotel.location.nearbyAttractions);
    } else {
      setNearbyAttractions([]);
    }
  }, [editingHotel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (rooms.length === 0) {
      alert('Please add at least one room type');
      return;
    }
    
    if (uploadedImages.length === 0) {
      alert('Please upload at least one hotel image');
      return;
    }
    
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    
    const hotelData = {
      name: formData.get('name'),
      chain: formData.get('chain'),
      description: formData.get('description'),
      shortDescription: formData.get('shortDescription'),
      starRating: parseInt(formData.get('starRating') as string),
      category: formData.get('category'),
      
      location: {
        address: {
          street: formData.get('street'),
          area: formData.get('area'),
          landmark: formData.get('landmark'),
          zipCode: formData.get('zipCode')
        },
        cityName: formData.get('city'),
        countryName: formData.get('country'),
        coordinates: {
          type: 'Point',
          coordinates: [
            parseFloat(formData.get('longitude') as string) || 0, 
            parseFloat(formData.get('latitude') as string) || 0
          ]
        },
        distanceFromCenter: parseFloat(formData.get('distanceFromCenter') as string) || 0,
        nearbyAttractions: nearbyAttractions
      },
      
      pricing: {
        priceRange: {
          min: parseInt(formData.get('minPrice') as string),
          max: parseInt(formData.get('maxPrice') as string),
          currency: formData.get('currency') || 'USD'
        },
        averageNightlyRate: parseInt(formData.get('avgPrice') as string)
      },
      
      contact: {
        phone: formData.get('phone'),
        email: formData.get('email'),
        website: formData.get('website'),
        checkIn: formData.get('checkIn') || '15:00',
        checkOut: formData.get('checkOut') || '11:00'
      },
      
      amenities: {
        general: (formData.get('generalAmenities') as string)?.split(',').map(a => ({
          name: a.trim(),
          category: 'general',
          available: true
        })).filter(a => a.name) || []
      },
      
      tags: (formData.get('tags') as string)?.split(',').map(t => t.trim()).filter(t => t) || [],
      
      policies: {
        checkIn: {
          from: formData.get('checkIn') || '15:00',
          to: '24:00',
          minAge: parseInt(formData.get('minAge') as string) || 18
        },
        checkOut: {
          from: '07:00',
          to: formData.get('checkOut') || '11:00'
        },
        children: {
          allowed: formData.get('childrenAllowed') === 'on',
          freeAge: parseInt(formData.get('childrenFreeAge') as string) || 12,
          extraBedFee: parseInt(formData.get('extraBedFee') as string) || 0
        },
        pets: {
          allowed: formData.get('petsAllowed') === 'on',
          fee: parseInt(formData.get('petsFee') as string) || 0
        },
        cancellation: {
          type: 'free',
          description: formData.get('cancellationPolicy') || 'Free cancellation up to 24 hours'
        },
        smoking: {
          allowed: false,
          areas: []
        }
      },
      
      rooms: rooms,
      images: uploadedImages,
      hotelCategory: formData.get('category'),
      featured: formData.get('featured') === 'on',
      verified: formData.get('verified') === 'on',
      status: formData.get('status') || 'active'
    };
    
    onSave(hotelData);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const formData = new FormData();
    Array.from(e.target.files).forEach((file, index) => {
      formData.append('images', file);
      formData.append(`alt_${index}`, `Hotel image ${index + 1}`);
      formData.append(`category_${index}`, 'exterior');
    });
    
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/upload/multiple`, {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data.images) {
          const newImages = result.data.images.map((img: any, index: number) => ({
            url: img.url,
            alt: img.alt,
            category: 'exterior',
            isPrimary: uploadedImages.length === 0 && index === 0,
            order: uploadedImages.length + index
          }));
          setUploadedImages(prev => [...prev, ...newImages]);
        }
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload images');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="p-6 max-w-6xl w-full mx-4 max-h-[95vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-2xl font-bold text-primary-900">
            {editingHotel ? 'Edit Hotel' : 'Add New Hotel'}
          </h4>
          <button onClick={onCancel} className="text-3xl text-primary-400 hover:text-primary-600">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-primary-50 p-4 rounded-lg">
            <h5 className="text-lg font-semibold text-primary-900 mb-4">Basic Information</h5>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Hotel Name *</label>
                <input name="name" type="text" required defaultValue={editingHotel?.name} 
                  className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Hotel Chain/Brand</label>
                <input name="chain" type="text" defaultValue={editingHotel?.chain} placeholder="Marriott, Hilton, etc." 
                  className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Star Rating *</label>
                <select name="starRating" required defaultValue={editingHotel?.starRating} 
                  className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean">
                  <option value="1">1 Star</option>
                  <option value="2">2 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="5">5 Stars</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Description *</label>
                <textarea name="description" rows={3} required defaultValue={editingHotel?.description} 
                  className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Short Description</label>
                <textarea name="shortDescription" rows={3} defaultValue={editingHotel?.shortDescription} 
                  placeholder="Brief description for listings" 
                  className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="bg-primary-50 p-4 rounded-lg">
            <h5 className="text-lg font-semibold text-primary-900 mb-4">Location Information</h5>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Street Address *</label>
                <input name="street" type="text" required defaultValue={editingHotel?.location?.address?.street} 
                  className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Area/District *</label>
                <input name="area" type="text" required defaultValue={editingHotel?.location?.address?.area} 
                  className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">City *</label>
                <input name="city" type="text" required 
                  defaultValue={editingHotel?.location?.cityName || editingHotel?.location?.city?.name || ''} 
                  placeholder="Paris, Tokyo, New York" 
                  className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Country *</label>
                <input name="country" type="text" required 
                  defaultValue={editingHotel?.location?.countryName || editingHotel?.location?.country?.name || ''} 
                  placeholder="France, Japan, USA" 
                  className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Zip Code</label>
                <input name="zipCode" type="text" defaultValue={editingHotel?.location?.address?.zipCode} 
                  className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Latitude</label>
                <input name="latitude" type="number" step="any" defaultValue={editingHotel?.location?.coordinates?.coordinates?.[1]} 
                  className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Longitude</label>
                <input name="longitude" type="number" step="any" defaultValue={editingHotel?.location?.coordinates?.coordinates?.[0]} 
                  className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Distance to Center (km)</label>
                <input name="distanceFromCenter" type="number" step="0.1" defaultValue={editingHotel?.location?.distanceFromCenter} 
                  className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Nearest Landmark</label>
                <input name="landmark" type="text" defaultValue={editingHotel?.location?.address?.landmark} 
                  placeholder="Eiffel Tower, Central Park" 
                  className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
              </div>
            </div>
          </div>

          {/* Pricing Information */}
          <div className="bg-primary-50 p-4 rounded-lg">
            <h5 className="text-lg font-semibold text-primary-900 mb-4">Pricing Information</h5>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Min Price *</label>
                <input name="minPrice" type="number" required defaultValue={editingHotel?.pricing?.priceRange?.min} 
                  className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Max Price *</label>
                <input name="maxPrice" type="number" required defaultValue={editingHotel?.pricing?.priceRange?.max} 
                  className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Average Price *</label>
                <input name="avgPrice" type="number" required defaultValue={editingHotel?.pricing?.averageNightlyRate} 
                  className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Currency</label>
                <select name="currency" defaultValue={editingHotel?.pricing?.priceRange?.currency || 'USD'} 
                  className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean">
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="JPY">JPY</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact & Policies */}
          <div className="bg-primary-50 p-4 rounded-lg">
            <h5 className="text-lg font-semibold text-primary-900 mb-4">Contact & Policies</h5>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Phone</label>
                <input name="phone" type="tel" defaultValue={editingHotel?.contact?.phone} 
                  className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Email</label>
                <input name="email" type="email" defaultValue={editingHotel?.contact?.email} 
                  className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Website</label>
                <input name="website" type="url" defaultValue={editingHotel?.contact?.website} 
                  className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Check-in Time</label>
                <input name="checkIn" type="time" defaultValue={editingHotel?.contact?.checkIn || '15:00'} 
                  className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Check-out Time</label>
                <input name="checkOut" type="time" defaultValue={editingHotel?.contact?.checkOut || '11:00'} 
                  className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Hotel Category</label>
                <select name="category" defaultValue={editingHotel?.category || editingHotel?.hotelCategory} 
                  className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean">
                  <option value="">Select Category</option>
                  <option value="luxury">Luxury</option>
                  <option value="business">Business</option>
                  <option value="boutique">Boutique</option>
                  <option value="resort">Resort</option>
                  <option value="budget">Budget</option>
                  <option value="extended-stay">Extended Stay</option>
                </select>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-primary-50 p-4 rounded-lg">
            <h5 className="text-lg font-semibold text-primary-900 mb-4">Amenities</h5>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">General Amenities</label>
                <textarea name="generalAmenities" rows={3} 
                  defaultValue={Array.isArray(editingHotel?.amenities?.general) 
                    ? editingHotel.amenities.general.map(a => typeof a === 'string' ? a : (a.name || String(a))).join(', ') 
                    : ''} 
                  placeholder="WiFi, Pool, Spa, Restaurant, Gym, Parking" 
                  className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Tags</label>
                <input name="tags" type="text" 
                  defaultValue={Array.isArray(editingHotel?.tags) ? editingHotel.tags.join(', ') : ''} 
                  placeholder="luxury, beachfront, spa, family-friendly" 
                  className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
              </div>
            </div>
          </div>

          {/* Policies */}
          <div className="bg-primary-50 p-4 rounded-lg">
            <h5 className="text-lg font-semibold text-primary-900 mb-4">Policies</h5>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Min Age</label>
                <input name="minAge" type="number" defaultValue={editingHotel?.policies?.checkIn?.minAge || 18} 
                  className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
              </div>
              <div>
                <label className="flex items-center">
                  <input type="checkbox" name="childrenAllowed" defaultChecked={editingHotel?.policies?.children?.allowed} className="mr-2" />
                  <span className="text-sm font-medium text-primary-700">Children Allowed</span>
                </label>
              </div>
              <div>
                <label className="flex items-center">
                  <input type="checkbox" name="petsAllowed" defaultChecked={editingHotel?.policies?.pets?.allowed} className="mr-2" />
                  <span className="text-sm font-medium text-primary-700">Pets Allowed</span>
                </label>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Children Free Age</label>
                <input name="childrenFreeAge" type="number" defaultValue={editingHotel?.policies?.children?.freeAge || 12} 
                  className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Extra Bed Fee</label>
                <input name="extraBedFee" type="number" defaultValue={editingHotel?.policies?.children?.extraBedFee || 0} 
                  className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Pet Fee</label>
                <input name="petsFee" type="number" defaultValue={editingHotel?.policies?.pets?.fee || 0} 
                  className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-primary-700 mb-2">Cancellation Policy</label>
              <textarea name="cancellationPolicy" rows={2} 
                defaultValue={editingHotel?.policies?.cancellation || 'Free cancellation up to 24 hours'} 
                className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
            </div>
          </div>

          {/* Dynamic Room Management */}
          <div className="bg-primary-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h5 className="text-lg font-semibold text-primary-900">Room Types ({rooms.length})</h5>
              <Button type="button" onClick={addRoom} size="sm">+ Add Room</Button>
            </div>
            
            {rooms.map((room, index) => (
              <div key={index} className="border border-primary-200 rounded-lg p-4 mb-4 bg-white">
                <div className="flex justify-between items-center mb-3">
                  <h6 className="font-medium text-primary-800">Room {index + 1}</h6>
                  {rooms.length > 1 && (
                    <Button type="button" onClick={() => removeRoom(index)} size="sm" variant="outline">Remove</Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-primary-600 mb-1">Room ID</label>
                    <input type="text" value={room.id} onChange={(e) => updateRoom(index, 'id', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-primary-200 rounded focus:ring-1 focus:ring-blue-ocean" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-primary-600 mb-1">Room Name</label>
                    <input type="text" value={room.name} onChange={(e) => updateRoom(index, 'name', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-primary-200 rounded focus:ring-1 focus:ring-blue-ocean" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-primary-600 mb-1">Type</label>
                    <select value={room.type} onChange={(e) => updateRoom(index, 'type', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-primary-200 rounded focus:ring-1 focus:ring-blue-ocean">
                      <option value="standard">Standard</option>
                      <option value="deluxe">Deluxe</option>
                      <option value="suite">Suite</option>
                      <option value="villa">Villa</option>
                      <option value="apartment">Apartment</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-primary-600 mb-1">Size (m²)</label>
                    <input type="number" value={room.size} onChange={(e) => updateRoom(index, 'size', parseInt(e.target.value))}
                      className="w-full px-2 py-1 text-sm border border-primary-200 rounded focus:ring-1 focus:ring-blue-ocean" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-primary-600 mb-1">Max Guests</label>
                    <input type="number" value={room.maxOccupancy} onChange={(e) => updateRoom(index, 'maxOccupancy', parseInt(e.target.value))}
                      className="w-full px-2 py-1 text-sm border border-primary-200 rounded focus:ring-1 focus:ring-blue-ocean" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-primary-600 mb-1">King Beds</label>
                    <input type="number" value={room.bedConfiguration.kingBeds} onChange={(e) => updateRoom(index, 'bedConfiguration.kingBeds', parseInt(e.target.value))}
                      className="w-full px-2 py-1 text-sm border border-primary-200 rounded focus:ring-1 focus:ring-blue-ocean" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-primary-600 mb-1">Queen Beds</label>
                    <input type="number" value={room.bedConfiguration.queenBeds} onChange={(e) => updateRoom(index, 'bedConfiguration.queenBeds', parseInt(e.target.value))}
                      className="w-full px-2 py-1 text-sm border border-primary-200 rounded focus:ring-1 focus:ring-blue-ocean" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-primary-600 mb-1">Double Beds</label>
                    <input type="number" value={room.bedConfiguration.doubleBeds} onChange={(e) => updateRoom(index, 'bedConfiguration.doubleBeds', parseInt(e.target.value))}
                      className="w-full px-2 py-1 text-sm border border-primary-200 rounded focus:ring-1 focus:ring-blue-ocean" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-primary-600 mb-1">Single Beds</label>
                    <input type="number" value={room.bedConfiguration.singleBeds} onChange={(e) => updateRoom(index, 'bedConfiguration.singleBeds', parseInt(e.target.value))}
                      className="w-full px-2 py-1 text-sm border border-primary-200 rounded focus:ring-1 focus:ring-blue-ocean" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-primary-600 mb-1">Total Rooms</label>
                    <input type="number" value={room.totalRooms} onChange={(e) => updateRoom(index, 'totalRooms', parseInt(e.target.value))}
                      className="w-full px-2 py-1 text-sm border border-primary-200 rounded focus:ring-1 focus:ring-blue-ocean" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-primary-600 mb-1">Base Rate</label>
                    <input type="number" value={room.pricing.baseRate} onChange={(e) => updateRoom(index, 'pricing.baseRate', parseInt(e.target.value))}
                      className="w-full px-2 py-1 text-sm border border-primary-200 rounded focus:ring-1 focus:ring-blue-ocean" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-primary-600 mb-1">Taxes</label>
                    <input type="number" value={room.pricing.taxes} onChange={(e) => updateRoom(index, 'pricing.taxes', parseInt(e.target.value))}
                      className="w-full px-2 py-1 text-sm border border-primary-200 rounded focus:ring-1 focus:ring-blue-ocean" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-primary-600 mb-1">Fees</label>
                    <input type="number" value={room.pricing.fees} onChange={(e) => updateRoom(index, 'pricing.fees', parseInt(e.target.value))}
                      className="w-full px-2 py-1 text-sm border border-primary-200 rounded focus:ring-1 focus:ring-blue-ocean" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-primary-600 mb-1">Currency</label>
                    <select value={room.pricing.currency} onChange={(e) => updateRoom(index, 'pricing.currency', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-primary-200 rounded focus:ring-1 focus:ring-blue-ocean">
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="JPY">JPY</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-primary-600 mb-1">Room Amenities (comma separated)</label>
                  <textarea value={room.amenities.join(', ')} onChange={(e) => updateRoom(index, 'amenities', e.target.value.split(',').map(a => a.trim()).filter(a => a))}
                    rows={2} placeholder="Ocean View, Balcony, Mini Bar, WiFi, AC"
                    className="w-full px-2 py-1 text-sm border border-primary-200 rounded focus:ring-1 focus:ring-blue-ocean" />
                </div>
              </div>
            ))}
          </div>
          
          {/* Nearby Attractions */}
          <div className="bg-primary-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h5 className="text-lg font-semibold text-primary-900">Nearby Attractions ({nearbyAttractions.length})</h5>
              <Button type="button" onClick={addNearbyAttraction} size="sm">+ Add Attraction</Button>
            </div>
            
            {nearbyAttractions.map((attraction, index) => (
              <div key={index} className="border border-primary-200 rounded-lg p-3 mb-3 bg-white">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-primary-700">Attraction {index + 1}</span>
                  <Button type="button" onClick={() => removeNearbyAttraction(index)} size="sm" variant="outline">Remove</Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-primary-600 mb-1">Name</label>
                    <input type="text" value={attraction.name} onChange={(e) => updateNearbyAttraction(index, 'name', e.target.value)}
                      placeholder="Eiffel Tower, Central Park"
                      className="w-full px-2 py-1 text-sm border border-primary-200 rounded focus:ring-1 focus:ring-blue-ocean" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-primary-600 mb-1">Distance (km)</label>
                    <input type="number" step="0.1" value={attraction.distance} onChange={(e) => updateNearbyAttraction(index, 'distance', parseFloat(e.target.value))}
                      className="w-full px-2 py-1 text-sm border border-primary-200 rounded focus:ring-1 focus:ring-blue-ocean" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-primary-600 mb-1">Type</label>
                    <input type="text" value={attraction.type} onChange={(e) => updateNearbyAttraction(index, 'type', e.target.value)}
                      placeholder="Museum, Park, Shopping"
                      className="w-full px-2 py-1 text-sm border border-primary-200 rounded focus:ring-1 focus:ring-blue-ocean" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Images */}
          <div className="bg-primary-50 p-4 rounded-lg">
            <h5 className="text-lg font-semibold text-primary-900 mb-4">Hotel Images</h5>
            
            <div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean"
              />
              <p className="text-xs text-primary-500 mt-1">Upload multiple images for the hotel</p>
            </div>

            {uploadedImages.length > 0 && (
              <div className="mt-4">
                <h6 className="text-sm font-medium text-primary-700 mb-2">Uploaded Images ({uploadedImages.length})</h6>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={image.url.startsWith('http') ? image.url : `${API_CONFIG.BASE_URL.replace('/api', '')}${image.url}`} 
                        alt={image.alt} 
                        className="w-full h-24 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setUploadedImages(prev => prev.filter((_, i) => i !== index))}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="bg-primary-50 p-4 rounded-lg">
            <h5 className="text-lg font-semibold text-primary-900 mb-4">Settings</h5>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input type="checkbox" name="featured" defaultChecked={editingHotel?.featured} className="mr-2" />
                  <span className="text-sm font-medium text-primary-700">Featured Hotel</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" name="verified" defaultChecked={editingHotel?.verified} className="mr-2" />
                  <span className="text-sm font-medium text-primary-700">Verified</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Status</label>
                <select name="status" defaultValue={editingHotel?.status || 'active'} 
                  className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="maintenance">Under Maintenance</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="submit">{editingHotel ? 'Update Hotel' : 'Create Hotel'}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EnhancedHotelForm;
