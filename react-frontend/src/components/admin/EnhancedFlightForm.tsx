import React, { useState } from 'react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import API_CONFIG from '@/config/api.config';

interface EnhancedFlightFormProps {
  editingFlight?: any;
  onSave: (flightData: any) => void;
  onCancel: () => void;
}

const EnhancedFlightForm: React.FC<EnhancedFlightFormProps> = ({ editingFlight, onSave, onCancel }) => {
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    
    const flightData = {
      flightNumber: formData.get('flightNumber'),
      category: formData.get('category'),
      flightType: formData.get('flightType'),
      
      aircraft: {
        type: formData.get('aircraftType'),
        model: formData.get('aircraftModel'),
        registration: formData.get('registration'),
        configuration: {
          economy: parseInt(formData.get('economySeats') as string) || 0,
          premiumEconomy: parseInt(formData.get('premiumEconomySeats') as string) || 0,
          business: parseInt(formData.get('businessSeats') as string) || 0,
          first: parseInt(formData.get('firstSeats') as string) || 0,
          total: (parseInt(formData.get('economySeats') as string) || 0) + 
                 (parseInt(formData.get('premiumEconomySeats') as string) || 0) + 
                 (parseInt(formData.get('businessSeats') as string) || 0) + 
                 (parseInt(formData.get('firstSeats') as string) || 0)
        }
      },
      
      route: {
        departure: {
          airport: formData.get('departureAirport'),
          scheduledTime: new Date(formData.get('departureTime') as string),
          terminal: formData.get('departureTerminal'),
          gate: formData.get('departureGate')
        },
        arrival: {
          airport: formData.get('arrivalAirport'),
          scheduledTime: new Date(formData.get('arrivalTime') as string),
          terminal: formData.get('arrivalTerminal'),
          gate: formData.get('arrivalGate')
        }
      },
      
      duration: {
        scheduled: parseInt(formData.get('duration') as string) || 0
      },
      
      distance: parseInt(formData.get('distance') as string) || 0,
      
      pricing: {
        economy: {
          basePrice: parseInt(formData.get('economyBasePrice') as string) || 0,
          taxes: parseInt(formData.get('economyTaxes') as string) || 0,
          fees: parseInt(formData.get('economyFees') as string) || 0,
          totalPrice: (parseInt(formData.get('economyBasePrice') as string) || 0) + 
                     (parseInt(formData.get('economyTaxes') as string) || 0) + 
                     (parseInt(formData.get('economyFees') as string) || 0),
          availability: parseInt(formData.get('economyAvailability') as string) || 0,
          restrictions: {
            refundable: formData.get('economyRefundable') === 'on',
            changeable: formData.get('economyChangeable') === 'on',
            changeFee: parseInt(formData.get('economyChangeFee') as string) || 0
          }
        },
        business: formData.get('businessBasePrice') ? {
          basePrice: parseInt(formData.get('businessBasePrice') as string) || 0,
          taxes: parseInt(formData.get('businessTaxes') as string) || 0,
          fees: parseInt(formData.get('businessFees') as string) || 0,
          totalPrice: (parseInt(formData.get('businessBasePrice') as string) || 0) + 
                     (parseInt(formData.get('businessTaxes') as string) || 0) + 
                     (parseInt(formData.get('businessFees') as string) || 0),
          availability: parseInt(formData.get('businessAvailability') as string) || 0,
          restrictions: {
            refundable: formData.get('businessRefundable') === 'on',
            changeable: formData.get('businessChangeable') === 'on',
            changeFee: parseInt(formData.get('businessChangeFee') as string) || 0
          }
        } : undefined
      },
      
      services: {
        meals: (formData.get('meals') as string)?.split(',').map(meal => ({
          class: 'economy',
          type: meal.trim(),
          description: meal.trim()
        })) || [],
        entertainment: (formData.get('entertainment') as string)?.split(',').map(e => e.trim()).filter(e => e) || [],
        wifi: {
          available: formData.get('wifiAvailable') === 'on',
          price: parseInt(formData.get('wifiPrice') as string) || 0
        },
        powerOutlets: formData.get('powerOutlets') === 'on',
        seatSelection: {
          free: formData.get('seatSelectionFree') === 'on',
          price: parseInt(formData.get('seatSelectionPrice') as string) || 0
        }
      },
      
      operatingDays: Array.from(formData.getAll('operatingDays')).map(day => parseInt(day as string)),
      validFrom: new Date(formData.get('validFrom') as string),
      validTo: new Date(formData.get('validTo') as string),
      
      images: uploadedImages,
      featured: formData.get('featured') === 'on',
      status: formData.get('status') || 'scheduled',
      tags: (formData.get('tags') as string)?.split(',').map(t => t.trim()).filter(t => t) || []
    };
    
    onSave(flightData);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const formData = new FormData();
    Array.from(e.target.files).forEach((file, index) => {
      formData.append('images', file);
      formData.append(`alt_${index}`, `Flight image ${index + 1}`);
      formData.append(`category_${index}`, 'aircraft');
    });
    
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/upload/multiple`, {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data.images) {
          setUploadedImages(prev => [...prev, ...result.data.images]);
        }
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
            {editingFlight ? 'Edit Flight' : 'Add New Flight'}
          </h4>
          <button onClick={onCancel} className="text-3xl text-primary-400 hover:text-primary-600">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-primary-50 p-4 rounded-lg">
            <h5 className="text-lg font-semibold text-primary-900 mb-4">Basic Information</h5>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Flight Number *</label>
                <input name="flightNumber" type="text" required defaultValue={editingFlight?.flightNumber} 
                  placeholder="AA123, BA456" 
                  className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Category *</label>
                <select name="category" required defaultValue={editingFlight?.category} 
                  className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean">
                  <option value="domestic">Domestic</option>
                  <option value="international">International</option>
                  <option value="charter">Charter</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Flight Type *</label>
                <select name="flightType" required defaultValue={editingFlight?.flightType} 
                  className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean">
                  <option value="direct">Direct</option>
                  <option value="connecting">Connecting</option>
                  <option value="codeshare">Codeshare</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Distance (km)</label>
                <input name="distance" type="number" defaultValue={editingFlight?.distance} 
                  className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
              </div>
            </div>
          </div>

          {/* Aircraft Information */}
          <div className="bg-primary-50 p-4 rounded-lg">
            <h5 className="text-lg font-semibold text-primary-900 mb-4">Aircraft Information</h5>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Aircraft Type *</label>
                <input name="aircraftType" type="text" required defaultValue={editingFlight?.aircraft?.type} 
                  placeholder="Boeing 737, Airbus A320" 
                  className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Aircraft Model</label>
                <input name="aircraftModel" type="text" defaultValue={editingFlight?.aircraft?.model} 
                  placeholder="737-800, A320-200" 
                  className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Registration</label>
                <input name="registration" type="text" defaultValue={editingFlight?.aircraft?.registration} 
                  placeholder="N123AA, G-ABCD" 
                  className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Economy Seats</label>
                <input name="economySeats" type="number" defaultValue={editingFlight?.aircraft?.configuration?.economy} 
                  className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Premium Economy</label>
                <input name="premiumEconomySeats" type="number" defaultValue={editingFlight?.aircraft?.configuration?.premiumEconomy} 
                  className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Business Seats</label>
                <input name="businessSeats" type="number" defaultValue={editingFlight?.aircraft?.configuration?.business} 
                  className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">First Class Seats</label>
                <input name="firstSeats" type="number" defaultValue={editingFlight?.aircraft?.configuration?.first} 
                  className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
              </div>
            </div>
          </div>

          {/* Route Information */}
          <div className="bg-primary-50 p-4 rounded-lg">
            <h5 className="text-lg font-semibold text-primary-900 mb-4">Route Information</h5>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h6 className="text-md font-medium text-primary-800 mb-3">Departure</h6>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Airport *</label>
                    <select name="departureAirport" required defaultValue={editingFlight?.route?.departure?.airport} 
                      className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean">
                      <option value="">Select Airport</option>
                      <option value="JFK">JFK - John F. Kennedy International</option>
                      <option value="LAX">LAX - Los Angeles International</option>
                      <option value="LHR">LHR - London Heathrow</option>
                      <option value="CDG">CDG - Charles de Gaulle</option>
                      <option value="NRT">NRT - Narita International</option>
                      <option value="DXB">DXB - Dubai International</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-primary-700 mb-2">Terminal</label>
                      <input name="departureTerminal" type="text" defaultValue={editingFlight?.route?.departure?.terminal} 
                        className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary-700 mb-2">Gate</label>
                      <input name="departureGate" type="text" defaultValue={editingFlight?.route?.departure?.gate} 
                        className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Departure Time *</label>
                    <input name="departureTime" type="datetime-local" required 
                      defaultValue={editingFlight?.route?.departure?.scheduledTime ? new Date(editingFlight.route.departure.scheduledTime).toISOString().slice(0, 16) : ''} 
                      className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
                  </div>
                </div>
              </div>

              <div>
                <h6 className="text-md font-medium text-primary-800 mb-3">Arrival</h6>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Airport *</label>
                    <select name="arrivalAirport" required defaultValue={editingFlight?.route?.arrival?.airport} 
                      className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean">
                      <option value="">Select Airport</option>
                      <option value="JFK">JFK - John F. Kennedy International</option>
                      <option value="LAX">LAX - Los Angeles International</option>
                      <option value="LHR">LHR - London Heathrow</option>
                      <option value="CDG">CDG - Charles de Gaulle</option>
                      <option value="NRT">NRT - Narita International</option>
                      <option value="DXB">DXB - Dubai International</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-primary-700 mb-2">Terminal</label>
                      <input name="arrivalTerminal" type="text" defaultValue={editingFlight?.route?.arrival?.terminal} 
                        className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary-700 mb-2">Gate</label>
                      <input name="arrivalGate" type="text" defaultValue={editingFlight?.route?.arrival?.gate} 
                        className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Arrival Time *</label>
                    <input name="arrivalTime" type="datetime-local" required 
                      defaultValue={editingFlight?.route?.arrival?.scheduledTime ? new Date(editingFlight.route.arrival.scheduledTime).toISOString().slice(0, 16) : ''} 
                      className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-primary-700 mb-2">Duration (minutes) *</label>
              <input name="duration" type="number" required defaultValue={editingFlight?.duration?.scheduled} 
                className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-primary-50 p-4 rounded-lg">
            <h5 className="text-lg font-semibold text-primary-900 mb-4">Pricing</h5>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h6 className="text-md font-medium text-primary-800 mb-3">Economy Class</h6>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Base Price *</label>
                    <input name="economyBasePrice" type="number" required defaultValue={editingFlight?.pricing?.economy?.basePrice} 
                      className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Taxes</label>
                    <input name="economyTaxes" type="number" defaultValue={editingFlight?.pricing?.economy?.taxes} 
                      className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Fees</label>
                    <input name="economyFees" type="number" defaultValue={editingFlight?.pricing?.economy?.fees} 
                      className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Availability</label>
                    <input name="economyAvailability" type="number" defaultValue={editingFlight?.pricing?.economy?.availability} 
                      className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
                  </div>
                </div>
                <div className="flex items-center space-x-4 mt-3">
                  <label className="flex items-center">
                    <input type="checkbox" name="economyRefundable" defaultChecked={editingFlight?.pricing?.economy?.restrictions?.refundable} className="mr-2" />
                    <span className="text-sm">Refundable</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" name="economyChangeable" defaultChecked={editingFlight?.pricing?.economy?.restrictions?.changeable} className="mr-2" />
                    <span className="text-sm">Changeable</span>
                  </label>
                </div>
              </div>

              <div>
                <h6 className="text-md font-medium text-primary-800 mb-3">Business Class (Optional)</h6>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Base Price</label>
                    <input name="businessBasePrice" type="number" defaultValue={editingFlight?.pricing?.business?.basePrice} 
                      className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Taxes</label>
                    <input name="businessTaxes" type="number" defaultValue={editingFlight?.pricing?.business?.taxes} 
                      className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Fees</label>
                    <input name="businessFees" type="number" defaultValue={editingFlight?.pricing?.business?.fees} 
                      className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Availability</label>
                    <input name="businessAvailability" type="number" defaultValue={editingFlight?.pricing?.business?.availability} 
                      className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
                  </div>
                </div>
                <div className="flex items-center space-x-4 mt-3">
                  <label className="flex items-center">
                    <input type="checkbox" name="businessRefundable" defaultChecked={editingFlight?.pricing?.business?.restrictions?.refundable} className="mr-2" />
                    <span className="text-sm">Refundable</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" name="businessChangeable" defaultChecked={editingFlight?.pricing?.business?.restrictions?.changeable} className="mr-2" />
                    <span className="text-sm">Changeable</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="bg-primary-50 p-4 rounded-lg">
            <h5 className="text-lg font-semibold text-primary-900 mb-4">Services & Amenities</h5>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Meals (comma separated)</label>
                <input name="meals" type="text" defaultValue={editingFlight?.services?.meals?.map((m: any) => m.type).join(', ')} 
                  placeholder="Breakfast, Lunch, Dinner, Snack" 
                  className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Entertainment (comma separated)</label>
                <input name="entertainment" type="text" defaultValue={editingFlight?.services?.entertainment?.join(', ')} 
                  placeholder="Movies, Music, Games, TV Shows" 
                  className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              <div className="flex items-center">
                <input type="checkbox" name="wifiAvailable" defaultChecked={editingFlight?.services?.wifi?.available} className="mr-2" />
                <span className="text-sm font-medium text-primary-700">WiFi Available</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">WiFi Price ($)</label>
                <input name="wifiPrice" type="number" defaultValue={editingFlight?.services?.wifi?.price} 
                  className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
              </div>
              <div className="flex items-center">
                <input type="checkbox" name="powerOutlets" defaultChecked={editingFlight?.services?.powerOutlets} className="mr-2" />
                <span className="text-sm font-medium text-primary-700">Power Outlets</span>
              </div>
              <div className="flex items-center">
                <input type="checkbox" name="seatSelectionFree" defaultChecked={editingFlight?.services?.seatSelection?.free} className="mr-2" />
                <span className="text-sm font-medium text-primary-700">Free Seat Selection</span>
              </div>
            </div>
          </div>

          {/* Schedule & Validity */}
          <div className="bg-primary-50 p-4 rounded-lg">
            <h5 className="text-lg font-semibold text-primary-900 mb-4">Schedule & Validity</h5>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Valid From</label>
                <input name="validFrom" type="date" defaultValue={editingFlight?.validFrom ? new Date(editingFlight.validFrom).toISOString().split('T')[0] : ''} 
                  className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Valid To</label>
                <input name="validTo" type="date" defaultValue={editingFlight?.validTo ? new Date(editingFlight.validTo).toISOString().split('T')[0] : ''} 
                  className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-primary-700 mb-2">Operating Days</label>
              <div className="flex space-x-4">
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => (
                  <label key={day} className="flex items-center">
                    <input type="checkbox" name="operatingDays" value={index} 
                      defaultChecked={editingFlight?.operatingDays?.includes(index)} className="mr-1" />
                    <span className="text-sm">{day.slice(0, 3)}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Images & Settings */}
          <div className="bg-primary-50 p-4 rounded-lg">
            <h5 className="text-lg font-semibold text-primary-900 mb-4">Images & Settings</h5>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-primary-700 mb-2">Flight Images</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean"
              />
              <p className="text-xs text-primary-500 mt-1">Upload aircraft, cabin, or meal images</p>
            </div>

            {uploadedImages.length > 0 && (
              <div className="mb-4">
                <h6 className="text-sm font-medium text-primary-700 mb-2">Uploaded Images ({uploadedImages.length})</h6>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={`${API_CONFIG.BASE_URL.replace('/api', '')}${image.url}`} 
                        alt={image.alt} 
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Tags (comma separated)</label>
                <input name="tags" type="text" defaultValue={editingFlight?.tags?.join(', ')} 
                  placeholder="direct, wifi, meals" 
                  className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
              </div>
              <div className="flex items-center">
                <input type="checkbox" name="featured" defaultChecked={editingFlight?.featured} className="mr-2" />
                <span className="text-sm font-medium text-primary-700">Featured Flight</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Status</label>
                <select name="status" defaultValue={editingFlight?.status || 'scheduled'} 
                  className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean">
                  <option value="scheduled">Scheduled</option>
                  <option value="delayed">Delayed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="boarding">Boarding</option>
                  <option value="departed">Departed</option>
                  <option value="arrived">Arrived</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="submit">{editingFlight ? 'Update Flight' : 'Create Flight'}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EnhancedFlightForm;
