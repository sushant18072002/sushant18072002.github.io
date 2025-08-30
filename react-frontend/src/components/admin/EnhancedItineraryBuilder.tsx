import React, { useState, useEffect } from 'react';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';

interface MasterActivity {
  _id: string;
  name: string;
  description: string;
  type: string;
  category: { name: string; icon: string };
  duration: { typical: number };
  pricing: { adult: number; currency: string };
  city: { name: string };
  difficulty: string;
}

interface TripActivity {
  activityRef?: string;
  time: string;
  title: string;
  description: string;
  type: string;
  duration: number;
  location: string;
  estimatedCost: { currency: string; amount: number; perPerson: boolean };
  included: boolean;
  optional: boolean;
  customNotes?: string;
  bookingRequired?: boolean;
}

interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  location: string;
  activities: TripActivity[];
  estimatedCost: { currency: string; amount: number };
  tips: string[];
}

interface EnhancedItineraryBuilderProps {
  days: number;
  itinerary: ItineraryDay[];
  onChange: (itinerary: ItineraryDay[]) => void;
  tripDestinations?: string[];
}

const EnhancedItineraryBuilder: React.FC<EnhancedItineraryBuilderProps> = ({ 
  days, 
  itinerary, 
  onChange, 
  tripDestinations = [] 
}) => {
  const [selectedDay, setSelectedDay] = useState(1);
  const [showActivitySelector, setShowActivitySelector] = useState(false);
  const [masterActivities, setMasterActivities] = useState<MasterActivity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<MasterActivity[]>([]);
  const [activityFilters, setActivityFilters] = useState({
    type: '',
    city: '',
    search: ''
  });
  const [showCustomForm, setShowCustomForm] = useState(false);

  useEffect(() => {
    loadMasterActivities();
  }, []);

  useEffect(() => {
    filterActivities();
  }, [masterActivities, activityFilters]);

  const loadMasterActivities = async () => {
    try {
      const { apiService } = await import('@/services/api');
      const response = await apiService.get('/master/activities');
      if (response.success) {
        setMasterActivities(response.data.activities || []);
      }
    } catch (error) {
      console.error('Failed to load activities:', error);
    }
  };

  const filterActivities = () => {
    let filtered = masterActivities;
    
    if (activityFilters.type) {
      filtered = filtered.filter(a => a.type === activityFilters.type);
    }
    
    if (activityFilters.city) {
      filtered = filtered.filter(a => a.city?._id === activityFilters.city);
    }
    
    if (activityFilters.search) {
      filtered = filtered.filter(a => 
        a.name.toLowerCase().includes(activityFilters.search.toLowerCase()) ||
        a.description?.toLowerCase().includes(activityFilters.search.toLowerCase())
      );
    }
    
    setFilteredActivities(filtered);
  };

  const initializeItinerary = () => {
    const newItinerary: ItineraryDay[] = [];
    for (let i = 1; i <= days; i++) {
      const existingDay = itinerary.find(d => d.day === i);
      newItinerary.push(existingDay || {
        day: i,
        title: `Day ${i}`,
        description: '',
        location: '',
        activities: [],
        estimatedCost: { currency: 'USD', amount: 0 },
        tips: []
      });
    }
    return newItinerary;
  };

  const currentItinerary = initializeItinerary();
  const currentDay = currentItinerary.find(d => d.day === selectedDay) || currentItinerary[0];

  const addMasterActivity = (masterActivity: MasterActivity, customTime: string = '09:00') => {
    const newActivity: TripActivity = {
      activityRef: masterActivity._id,
      time: customTime,
      title: masterActivity.name,
      description: masterActivity.description,
      type: masterActivity.type,
      duration: masterActivity.duration?.typical || 120,
      location: masterActivity.city?.name || '',
      estimatedCost: {
        currency: masterActivity.pricing?.currency || 'USD',
        amount: masterActivity.pricing?.adult || 0,
        perPerson: true
      },
      included: true,
      optional: false,
      bookingRequired: true
    };

    const updatedItinerary = currentItinerary.map(day => 
      day.day === selectedDay 
        ? { ...day, activities: [...day.activities, newActivity] }
        : day
    );
    onChange(updatedItinerary);
    setShowActivitySelector(false);
  };

  const addCustomActivity = (activityData: Partial<TripActivity>) => {
    const newActivity: TripActivity = {
      time: activityData.time || '09:00',
      title: activityData.title || '',
      description: activityData.description || '',
      type: activityData.type || 'activity',
      duration: activityData.duration || 60,
      location: activityData.location || '',
      estimatedCost: activityData.estimatedCost || { currency: 'USD', amount: 0, perPerson: true },
      included: activityData.included ?? true,
      optional: activityData.optional ?? false,
      customNotes: activityData.customNotes
    };

    const updatedItinerary = currentItinerary.map(day => 
      day.day === selectedDay 
        ? { ...day, activities: [...day.activities, newActivity] }
        : day
    );
    onChange(updatedItinerary);
    setShowCustomForm(false);
  };

  const updateDay = (updates: Partial<ItineraryDay>) => {
    const updatedItinerary = currentItinerary.map(day => 
      day.day === selectedDay ? { ...day, ...updates } : day
    );
    onChange(updatedItinerary);
  };

  const removeActivity = (index: number) => {
    const updatedItinerary = currentItinerary.map(day => 
      day.day === selectedDay 
        ? { ...day, activities: day.activities.filter((_, i) => i !== index) }
        : day
    );
    onChange(updatedItinerary);
  };

  const updateActivity = (index: number, updates: Partial<TripActivity>) => {
    const updatedItinerary = currentItinerary.map(day => 
      day.day === selectedDay 
        ? { 
            ...day, 
            activities: day.activities.map((activity, i) => 
              i === index ? { ...activity, ...updates } : activity
            )
          }
        : day
    );
    onChange(updatedItinerary);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-primary-900">Enhanced Trip Itinerary ({days} days)</h3>
        <div className="text-sm text-primary-600">
          Plan activities using master data or create custom ones
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Day Selector */}
        <div className="lg:col-span-1">
          <div className="space-y-2">
            {Array.from({ length: days }, (_, i) => i + 1).map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                  selectedDay === day
                    ? 'bg-blue-ocean text-white border-blue-ocean'
                    : 'bg-white text-primary-700 border-primary-200 hover:border-blue-ocean'
                }`}
              >
                <div className="font-semibold">Day {day}</div>
                <div className="text-sm opacity-75">
                  {currentItinerary.find(d => d.day === day)?.activities.length || 0} activities
                </div>
                <div className="text-xs opacity-60">
                  ${currentItinerary.find(d => d.day === day)?.activities.reduce((sum, a) => sum + (a.estimatedCost?.amount || 0), 0) || 0}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Day Details */}
        <div className="lg:col-span-3">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xl font-bold text-primary-900">Day {selectedDay}</h4>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowActivitySelector(true)}>
                  📋 Add from Library
                </Button>
                <Button onClick={() => setShowCustomForm(true)}>
                  ➕ Custom Activity
                </Button>
              </div>
            </div>

            {/* Day Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Day Title</label>
                <input
                  type="text"
                  value={currentDay.title}
                  onChange={(e) => updateDay({ title: e.target.value })}
                  className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean"
                  placeholder="e.g., Arrival & City Tour"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Location</label>
                <input
                  type="text"
                  value={currentDay.location}
                  onChange={(e) => updateDay({ location: e.target.value })}
                  className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean"
                  placeholder="e.g., Tokyo, Japan"
                />
              </div>
            </div>

            {/* Activities Timeline */}
            <div className="space-y-4">
              <h5 className="font-semibold text-primary-900">Activities Timeline</h5>
              
              {currentDay.activities.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-primary-200 rounded-lg">
                  <div className="text-4xl mb-2">📅</div>
                  <p className="text-primary-600 mb-4">No activities planned for this day</p>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={() => setShowActivitySelector(true)}>Browse Activities</Button>
                    <Button variant="outline" onClick={() => setShowCustomForm(true)}>Create Custom</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentDay.activities
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map((activity, index) => (
                    <div key={index} className="border border-primary-200 rounded-lg p-4">
                      <div className="flex items-start gap-4">
                        <div className="text-sm font-mono text-primary-600 min-w-[60px] mt-1">
                          <input
                            type="time"
                            value={activity.time}
                            onChange={(e) => updateActivity(index, { time: e.target.value })}
                            className="w-full text-xs border-0 bg-transparent"
                          />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h6 className="font-semibold text-primary-900">{activity.title}</h6>
                            {activity.activityRef && (
                              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                                📋 Library
                              </span>
                            )}
                            {activity.optional && (
                              <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded">
                                Optional
                              </span>
                            )}
                          </div>
                          
                          <p className="text-sm text-primary-600 mb-2">{activity.description}</p>
                          
                          <div className="flex items-center gap-4 text-xs text-primary-500">
                            <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded">
                              {activity.type}
                            </span>
                            <span>{Math.floor(activity.duration / 60)}h {activity.duration % 60}m</span>
                            <span>📍 {activity.location}</span>
                            {activity.estimatedCost.amount > 0 && (
                              <span className="text-emerald font-medium">
                                ${activity.estimatedCost.amount}
                              </span>
                            )}
                          </div>
                          
                          {activity.customNotes && (
                            <div className="mt-2 p-2 bg-amber-50 rounded text-xs">
                              <strong>Notes:</strong> {activity.customNotes}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => removeActivity(index)}>
                            🗑️
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Day Summary */}
            <div className="mt-6 p-4 bg-primary-50 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-primary-900">
                    {currentDay.activities.length}
                  </div>
                  <div className="text-sm text-primary-600">Activities</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-primary-900">
                    {Math.floor(currentDay.activities.reduce((sum, a) => sum + a.duration, 0) / 60)}h
                  </div>
                  <div className="text-sm text-primary-600">Total Time</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-emerald">
                    ${currentDay.activities.reduce((sum, a) => sum + (a.estimatedCost?.amount || 0), 0)}
                  </div>
                  <div className="text-sm text-primary-600">Estimated Cost</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Activity Selector Modal */}
      {showActivitySelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-bold text-primary-900">Select Activity from Library</h4>
                <button onClick={() => setShowActivitySelector(false)} className="text-2xl text-primary-400">×</button>
              </div>
              
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Search activities..."
                  value={activityFilters.search}
                  onChange={(e) => setActivityFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="px-3 py-2 border border-primary-300 rounded-md"
                />
                <select
                  value={activityFilters.type}
                  onChange={(e) => setActivityFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="px-3 py-2 border border-primary-300 rounded-md"
                >
                  <option value="">All Types</option>
                  <option value="sightseeing">Sightseeing</option>
                  <option value="adventure">Adventure</option>
                  <option value="cultural">Cultural</option>
                  <option value="food">Food & Dining</option>
                  <option value="entertainment">Entertainment</option>
                </select>
                <select
                  value={activityFilters.city}
                  onChange={(e) => setActivityFilters(prev => ({ ...prev, city: e.target.value }))}
                  className="px-3 py-2 border border-primary-300 rounded-md"
                >
                  <option value="">All Cities</option>
                  {/* Add city options based on trip destinations */}
                </select>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredActivities.map(activity => (
                  <div key={activity._id} className="border border-primary-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h6 className="font-semibold text-primary-900">{activity.name}</h6>
                      <span className="text-emerald font-bold">${activity.pricing?.adult}</span>
                    </div>
                    <p className="text-sm text-primary-600 mb-3">{activity.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded">
                          {activity.category?.icon} {activity.type}
                        </span>
                        <span>{activity.duration?.typical}min</span>
                        <span>📍 {activity.city?.name}</span>
                      </div>
                      <Button size="sm" onClick={() => addMasterActivity(activity)}>
                        Add
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Custom Activity Form Modal */}
      {showCustomForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-bold text-primary-900">Create Custom Activity</h4>
              <button onClick={() => setShowCustomForm(false)} className="text-2xl text-primary-400">×</button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              addCustomActivity({
                time: formData.get('time') as string,
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                type: formData.get('type') as string,
                duration: parseInt(formData.get('duration') as string),
                location: formData.get('location') as string,
                estimatedCost: {
                  currency: 'USD',
                  amount: parseInt(formData.get('cost') as string) || 0,
                  perPerson: true
                },
                included: formData.get('included') === 'on',
                optional: formData.get('optional') === 'on',
                customNotes: formData.get('notes') as string
              });
            }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">Time</label>
                  <input name="time" type="time" defaultValue="09:00" required className="w-full px-3 py-2 border border-primary-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">Duration (minutes)</label>
                  <input name="duration" type="number" min="15" step="15" defaultValue="60" className="w-full px-3 py-2 border border-primary-300 rounded-md" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Activity Title</label>
                <input name="title" type="text" required className="w-full px-3 py-2 border border-primary-300 rounded-md" />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Description</label>
                <textarea name="description" rows={2} className="w-full px-3 py-2 border border-primary-300 rounded-md" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">Type</label>
                  <select name="type" required className="w-full px-3 py-2 border border-primary-300 rounded-md">
                    <option value="activity">Activity</option>
                    <option value="meal">Meal</option>
                    <option value="transport">Transport</option>
                    <option value="accommodation">Accommodation</option>
                    <option value="free-time">Free Time</option>
                    <option value="sightseeing">Sightseeing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">Location</label>
                  <input name="location" type="text" className="w-full px-3 py-2 border border-primary-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">Cost ($)</label>
                  <input name="cost" type="number" min="0" defaultValue="0" className="w-full px-3 py-2 border border-primary-300 rounded-md" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Notes</label>
                <textarea name="notes" rows={2} className="w-full px-3 py-2 border border-primary-300 rounded-md" placeholder="Special instructions or notes..." />
              </div>

              <div className="flex gap-4">
                <label className="flex items-center">
                  <input name="included" type="checkbox" defaultChecked className="mr-2" />
                  <span className="text-sm">Included in price</span>
                </label>
                <label className="flex items-center">
                  <input name="optional" type="checkbox" className="mr-2" />
                  <span className="text-sm">Optional activity</span>
                </label>
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowCustomForm(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Activity</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EnhancedItineraryBuilder;