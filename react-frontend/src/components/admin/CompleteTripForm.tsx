import React, { useState, useEffect } from 'react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import ImageUpload from './ImageUpload';

interface CompleteFlightFormProps {
  editingFlight?: any;
  onSave: (flightData: any) => void;
  onCancel: () => void;
}

const CompleteFlightForm: React.FC<CompleteFlightFormProps> = ({ editingFlight, onSave, onCancel }) => {
  const [airlines, setAirlines] = useState<any[]>([]);
  const [airports, setAirports] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [uploadedImages, setUploadedImages] = useState<any[]>(editingFlight?.images || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    try {
      const [airlinesRes, airportsRes, categoriesRes] = await Promise.all([
        fetch('http://localhost:3000/api/master/airlines').then(r => r.json()),
        fetch('http://localhost:3000/api/master/airports').then(r => r.json()),
        fetch('http://localhost:3000/api/master/categories?type=flight').then(r => r.json())
      ]);
      
      setAirlines(airlinesRes.data?.airlines || []);
      setAirports(airportsRes.data?.airports || []);
      setCategories(categoriesRes.data?.categories || []);
    } catch (error) {
      console.error('Failed to load form data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    
    const flightData = {
      // Basic Information
      flightNumber: formData.get('flightNumber'),
      airline: formData.get('airline'),
      category: formData.get('category'),
      flightCategory: formData.get('flightCategory'),
      flightType: formData.get('flightType'),
      featured: formData.get('featured') === 'on',
      
      // Aircraft Details
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
      
      // Route Information
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
      
      // Comprehensive Pricing
      pricing: {
        economy: {
          fareClass: formData.get('economyFareClass') || 'Y',
          basePrice: parseFloat(formData.get('economyBasePrice') as string) || 0,
          taxes: parseFloat(formData.get('economyTaxes') as string) || 0,
          fees: parseFloat(formData.get('economyFees') as string) || 0,
          totalPrice: (parseFloat(formData.get('economyBasePrice') as string) || 0) + 
                     (parseFloat(formData.get('economyTaxes') as string) || 0) + 
                     (parseFloat(formData.get('economyFees') as string) || 0),
          availability: parseInt(formData.get('economyAvailability') as string) || 0,
          baggage: {
            included: parseInt(formData.get('economyBaggageIncluded') as string) || 0,
            additional: {
              price: parseFloat(formData.get('economyBaggagePrice') as string) || 0,
              weight: parseInt(formData.get('economyBaggageWeight') as string) || 23
            }
          },
          restrictions: {
            refundable: formData.get('economyRefundable') === 'on',
            changeable: formData.get('economyChangeable') === 'on',
            changeFee: parseFloat(formData.get('economyChangeFee') as string) || 0
          }
        },
        ...(formData.get('businessBasePrice') && {
          business: {
            fareClass: formData.get('businessFareClass') || 'C',
            basePrice: parseFloat(formData.get('businessBasePrice') as string) || 0,
            taxes: parseFloat(formData.get('businessTaxes') as string) || 0,
            fees: parseFloat(formData.get('businessFees') as string) || 0,
            totalPrice: (parseFloat(formData.get('businessBasePrice') as string) || 0) + 
                       (parseFloat(formData.get('businessTaxes') as string) || 0) + 
                       (parseFloat(formData.get('businessFees') as string) || 0),
            availability: parseInt(formData.get('businessAvailability') as string) || 0,
            baggage: {
              included: parseInt(formData.get('businessBaggageIncluded') as string) || 2,
              additional: {
                price: parseFloat(formData.get('businessBaggagePrice') as string) || 0,
                weight: parseInt(formData.get('businessBaggageWeight') as string) || 32
              }
            },
            restrictions: {
              refundable: formData.get('businessRefundable') === 'on',
              changeable: formData.get('businessChangeable') === 'on',
              changeFee: parseFloat(formData.get('businessChangeFee') as string) || 0
            }
          }
        })
      },
      
      // Enhanced Services
      services: {
        meals: (formData.get('meals') as string)?.split(',').map(meal => ({
          class: 'economy',
          type: meal.trim(),
          description: meal.trim(),
          included: true
        })) || [],
        entertainment: (formData.get('entertainment') as string)?.split(',').map(ent => ({
          type: 'movies',
          description: ent.trim(),
          available: true
        })) || [],
        wifi: {
          available: formData.get('wifiAvailable') === 'on',
          price: parseFloat(formData.get('wifiPrice') as string) || 0,
          speed: formData.get('wifiSpeed') || 'standard',
          coverage: formData.get('wifiCoverage') || 'full'
        },
        powerOutlets: {
          available: formData.get('powerOutlets') === 'on',
          type: formData.get('powerType') || 'USB',
          location: formData.get('powerLocation') || 'every seat'
        },
        seatSelection: {
          free: formData.get('seatSelectionFree') === 'on',
          price: parseFloat(formData.get('seatSelectionPrice') as string) || 0,
          advanceBooking: true
        },
        baggage: {
          carryOn: {
            included: true,
            weight: parseInt(formData.get('carryOnWeight') as string) || 7,
            dimensions: formData.get('carryOnDimensions') || '55x40x20cm'
          },
          checked: {
            included: parseInt(formData.get('checkedBaggageIncluded') as string) || 1,
            additionalFee: parseFloat(formData.get('checkedBaggageFee') as string) || 0,
            maxWeight: parseInt(formData.get('checkedBaggageWeight') as string) || 23
          }
        }
      },
      
      // Policies
      policies: {
        cancellation: {
          allowed: formData.get('cancellationAllowed') === 'on',
          fee: parseFloat(formData.get('cancellationFee') as string) || 0,
          timeLimit: parseInt(formData.get('cancellationTimeLimit') as string) || 24
        },
        modification: {
          allowed: formData.get('modificationAllowed') === 'on',
          fee: parseFloat(formData.get('modificationFee') as string) || 0,
          timeLimit: parseInt(formData.get('modificationTimeLimit') as string) || 24
        }
      },
      
      // Schedule & Validity
      operatingDays: Array.from(formData.getAll('operatingDays')).map(day => parseInt(day as string)),
      validFrom: formData.get('validFrom') ? new Date(formData.get('validFrom') as string) : new Date(),
      validTo: formData.get('validTo') ? new Date(formData.get('validTo') as string) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      
      // Media & Metadata
      images: uploadedImages,
      tags: (formData.get('tags') as string)?.split(',').map(t => t.trim()).filter(t => t) || [],
      status: formData.get('status') || 'scheduled',
      
      // SEO
      seo: {
        metaTitle: formData.get('metaTitle'),
        metaDescription: formData.get('metaDescription'),
        keywords: (formData.get('keywords') as string)?.split(',').map(k => k.trim()).filter(k => k) || []
      }
    };
    
    try {
      await onSave(flightData);
    } catch (error) {
      console.error('Failed to save flight:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-7xl max-h-[95vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-primary-900">
              {editingFlight ? 'Edit Flight' : 'Add New Flight'}
            </h2>
            <button onClick={onCancel} className="text-3xl text-primary-400 hover:text-primary-600">×</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <Card className="p-6 bg-blue-50">
              <h3 className="text-lg font-semibold text-primary-900 mb-4">✈️ Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">Flight Number *</label>
                  <input 
                    name="flightNumber" 
                    type="text" 
                    required 
                    defaultValue={editingFlight?.flightNumber}
                    placeholder="AA123, BA456"
                    className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">Airline *</label>
                  <select 
                    name="airline" 
                    required 
                    defaultValue={editingFlight?.airline?._id}
                    className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean"
                  >
                    <option value="">Select Airline</option>
                    {airlines.map(airline => (
                      <option key={airline._id} value={airline._id}>{airline.name} ({airline.code})</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">Category</label>
                  <select 
                    name="category" 
                    defaultValue={editingFlight?.category?._id}
                    className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean"
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category._id} value={category._id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">Flight Type *</label>
                  <select 
                    name="flightType" 
                    required 
                    defaultValue={editingFlight?.flightType}
                    className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean"
                  >
                    <option value="direct">Direct</option>
                    <option value="connecting">Connecting</option>
                    <option value="codeshare">Codeshare</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">Flight Category</label>
                  <select 
                    name="flightCategory" 
                    defaultValue={editingFlight?.flightCategory}
                    className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean"
                  >
                    <option value="domestic">Domestic</option>
                    <option value="international">International</option>
                    <option value="charter">Charter</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">Distance (km)</label>
                  <input 
                    name="distance" 
                    type="number" 
                    defaultValue={editingFlight?.distance}
                    className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" 
                  />
                </div>
                
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    name="featured" 
                    defaultChecked={editingFlight?.featured}
                    className="mr-2" 
                  />
                  <span className="text-sm font-medium text-primary-700">Featured Flight</span>
                </div>
              </div>
            </Card>

            {/* Aircraft Information */}
            <Card className="p-6 bg-green-50">
              <h3 className="text-lg font-semibold text-primary-900 mb-4">🛩️ Aircraft Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">Aircraft Type *</label>
                  <input 
                    name="aircraftType" 
                    type="text" 
                    required 
                    defaultValue={editingFlight?.aircraft?.type}
                    placeholder="Boeing 737, Airbus A320"
                    className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">Aircraft Model</label>
                  <input 
                    name="aircraftModel" 
                    type="text" 
                    defaultValue={editingFlight?.aircraft?.model}
                    placeholder="737-800, A320-200"
                    className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">Registration</label>
                  <input 
                    name="registration" 
                    type="text" 
                    defaultValue={editingFlight?.aircraft?.registration}
                    placeholder="N123AA, G-ABCD"
                    className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">Economy Seats</label>
                  <input 
                    name="economySeats" 
                    type="number" 
                    defaultValue={editingFlight?.aircraft?.configuration?.economy}
                    className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">Premium Economy</label>
                  <input 
                    name="premiumEconomySeats" 
                    type="number" 
                    defaultValue={editingFlight?.aircraft?.configuration?.premiumEconomy}
                    className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">Business Seats</label>
                  <input 
                    name="businessSeats" 
                    type="number" 
                    defaultValue={editingFlight?.aircraft?.configuration?.business}
                    className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">First Class Seats</label>
                  <input 
                    name="firstSeats" 
                    type="number" 
                    defaultValue={editingFlight?.aircraft?.configuration?.first}
                    className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" 
                  />
                </div>
              </div>
            </Card>

            {/* Route Information */}
            <Card className="p-6 bg-purple-50">
              <h3 className="text-lg font-semibold text-primary-900 mb-4">🗺️ Route Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-md font-medium text-primary-800 mb-3">Departure</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-primary-700 mb-2">Airport *</label>
                      <select 
                        name="departureAirport" 
                        required 
                        defaultValue={editingFlight?.route?.departure?.airport}
                        className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean"
                      >
                        <option value="">Select Airport</option>
                        {airports.map(airport => (
                          <option key={airport._id} value={airport._id}>
                            {airport.code} - {airport.name} ({airport.city})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-primary-700 mb-2">Terminal</label>
                        <input 
                          name="departureTerminal" 
                          type="text" 
                          defaultValue={editingFlight?.route?.departure?.terminal}
                          className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-primary-700 mb-2">Gate</label>
                        <input 
                          name="departureGate" 
                          type="text" 
                          defaultValue={editingFlight?.route?.departure?.gate}
                          className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary-700 mb-2">Departure Time *</label>
                      <input 
                        name="departureTime" 
                        type="datetime-local" 
                        required
                        defaultValue={editingFlight?.route?.departure?.scheduledTime ? 
                          new Date(editingFlight.route.departure.scheduledTime).toISOString().slice(0, 16) : ''}
                        className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" 
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-medium text-primary-800 mb-3">Arrival</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-primary-700 mb-2">Airport *</label>
                      <select 
                        name="arrivalAirport" 
                        required 
                        defaultValue={editingFlight?.route?.arrival?.airport}
                        className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean"
                      >
                        <option value="">Select Airport</option>
                        {airports.map(airport => (
                          <option key={airport._id} value={airport._id}>
                            {airport.code} - {airport.name} ({airport.city})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-primary-700 mb-2">Terminal</label>
                        <input 
                          name="arrivalTerminal" 
                          type="text" 
                          defaultValue={editingFlight?.route?.arrival?.terminal}
                          className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-primary-700 mb-2">Gate</label>
                        <input 
                          name="arrivalGate" 
                          type="text" 
                          defaultValue={editingFlight?.route?.arrival?.gate}
                          className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary-700 mb-2">Arrival Time *</label>
                      <input 
                        name="arrivalTime" 
                        type="datetime-local" 
                        required
                        defaultValue={editingFlight?.route?.arrival?.scheduledTime ? 
                          new Date(editingFlight.route.arrival.scheduledTime).toISOString().slice(0, 16) : ''}
                        className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-primary-700 mb-2">Duration (minutes) *</label>
                <input 
                  name="duration" 
                  type="number" 
                  required 
                  defaultValue={editingFlight?.duration?.scheduled}
                  className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" 
                />
              </div>
            </Card>

            {/* Images */}
            <Card className="p-6 bg-amber-50">
              <h3 className="text-lg font-semibold text-primary-900 mb-4">📸 Flight Images</h3>
              <ImageUpload
                images={uploadedImages}
                onImagesChange={setUploadedImages}
                maxImages={10}
                category="flight"
              />
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : editingFlight ? 'Update Flight' : 'Create Flight'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default CompleteFlightForm;