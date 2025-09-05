import React, { useState } from 'react';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';

interface Activity {
  time: string;
  title: string;
  description: string;
  type: 'transport' | 'activity' | 'meal' | 'accommodation' | 'free-time';
  duration: number;
  location: string;
  estimatedCost: {
    currency: string;
    amount: number;
    perPerson: boolean;
  };
  included: boolean;
  optional: boolean;
}

interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  location: string;
  activities: Activity[];
  estimatedCost: {
    currency: string;
    amount: number;
  };
  tips: string[];
}

interface ItineraryBuilderProps {
  initialItinerary?: any;
  tripDuration?: number;
  onSave: (itineraryData: any) => Promise<void>;
}

const ItineraryBuilder: React.FC<ItineraryBuilderProps> = ({ initialItinerary = { overview: '', days: [] }, tripDuration = 7, onSave }) => {
  const [days] = useState(tripDuration);
  const [selectedDay, setSelectedDay] = useState(1);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState<number | null>(null);
  
  // Initialize itinerary state properly
  const [currentItinerary, setCurrentItinerary] = useState<ItineraryDay[]>(() => {
    const newItinerary: ItineraryDay[] = [];
    for (let i = 1; i <= tripDuration; i++) {
      const existingDay = initialItinerary.days?.find((d: any) => d.day === i);
      newItinerary.push(existingDay ? {
        ...existingDay,
        location: existingDay.locationName || existingDay.location || ''
      } : {
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
  });

  const currentDay = currentItinerary.find(d => d.day === selectedDay) || {
    day: selectedDay,
    title: `Day ${selectedDay}`,
    description: '',
    location: '',
    activities: [],
    estimatedCost: { currency: 'USD', amount: 0 },
    tips: []
  };

  const addActivity = (activity: Omit<Activity, 'time'>) => {
    const newActivity: Activity = {
      ...activity,
      time: '09:00'
    };

    const updatedItinerary = currentItinerary.map(day => 
      day.day === selectedDay 
        ? { ...day, activities: [...day.activities, newActivity] }
        : day
    );
    setCurrentItinerary(updatedItinerary);
    setShowActivityForm(false);
  };

  const updateDay = (updates: Partial<ItineraryDay>) => {
    const updatedItinerary = currentItinerary.map(day => 
      day.day === selectedDay 
        ? { ...day, ...updates }
        : day
    );
    setCurrentItinerary(updatedItinerary);
  };

  const updateActivity = (activityIndex: number, updatedActivity: Activity) => {
    const updatedItinerary = currentItinerary.map(day => 
      day.day === selectedDay 
        ? { 
            ...day, 
            activities: day.activities.map((activity, index) => 
              index === activityIndex ? { ...activity, ...updatedActivity } : activity
            )
          }
        : day
    );
    setCurrentItinerary(updatedItinerary);
    setEditingActivity(null);
    setShowActivityForm(false);
  };

  const removeActivity = (index: number) => {
    const updatedItinerary = currentItinerary.map(day => 
      day.day === selectedDay 
        ? { ...day, activities: day.activities.filter((_, i) => i !== index) }
        : day
    );
    setCurrentItinerary(updatedItinerary);
  };

  const handleSave = async () => {
    const validatedItinerary = {
      overview: initialItinerary.overview || '',
      days: currentItinerary.map((day, index) => ({
        day: day.day || index + 1,
        title: day.title || `Day ${index + 1}`,
        description: day.description || '',
        locationName: day.location || '',
        activities: (day.activities || []).map(activity => ({
          ...activity,
          location: typeof activity.location === 'string' ? activity.location : activity.location || ''
        })),
        estimatedCost: day.estimatedCost || { currency: 'USD', amount: 0 },
        tips: day.tips || []
      }))
    };
    
    await onSave(validatedItinerary);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-primary-900">Trip Itinerary ({days} days)</h3>
        <Button onClick={handleSave} size="sm">
          💾 Save Itinerary
        </Button>
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
              </button>
            ))}
          </div>
        </div>

        {/* Day Details */}
        <div className="lg:col-span-3">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xl font-bold text-primary-900">Day {selectedDay}</h4>
              <Button onClick={() => setShowActivityForm(true)}>
                + Add Activity
              </Button>
            </div>

            {/* Day Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Day Title</label>
                <input
                  type="text"
                  value={currentDay?.title || ''}
                  onChange={(e) => updateDay({ title: e.target.value })}
                  className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean"
                  placeholder="e.g., Arrival & City Tour"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Location</label>
                <input
                  type="text"
                  value={currentDay?.location || ''}
                  onChange={(e) => updateDay({ location: e.target.value })}
                  className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean"
                  placeholder="e.g., Tokyo, Japan"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-primary-700 mb-2">Description</label>
              <textarea
                value={currentDay?.description || ''}
                onChange={(e) => updateDay({ description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean"
                placeholder="Brief description of the day's activities..."
              />
            </div>

            {/* Activities */}
            <div className="space-y-4">
              <h5 className="font-semibold text-primary-900">Activities</h5>
              
              {currentDay.activities.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-primary-200 rounded-lg">
                  <div className="text-4xl mb-2">📅</div>
                  <p className="text-primary-600 mb-4">No activities planned for this day</p>
                  <Button onClick={() => setShowActivityForm(true)}>Add First Activity</Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentDay.activities.map((activity, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 border border-primary-200 rounded-lg">
                      <div className="text-sm font-mono text-primary-600 min-w-[60px]">
                        {activity.time}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-primary-900">{activity.title}</div>
                        <div className="text-sm text-primary-600">{activity.description}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                            {activity.type}
                          </span>
                          <span className="text-xs text-primary-500">
                            {activity.duration}min
                          </span>
                          {activity.estimatedCost.amount > 0 && (
                            <span className="text-xs text-emerald">
                              ${activity.estimatedCost.amount}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setEditingActivity(index)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => removeActivity(index)}>
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tips */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-primary-700 mb-2">Tips for this day</label>
              <textarea
                value={currentDay.tips.join('\n')}
                onChange={(e) => updateDay({ tips: e.target.value.split('\n').filter(tip => tip.trim()) })}
                rows={3}
                className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean"
                placeholder="Enter tips, one per line..."
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Activity Form Modal */}
      {(showActivityForm || editingActivity !== null) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-bold text-primary-900">
                {editingActivity !== null ? 'Edit Activity' : 'Add Activity'}
              </h4>
              <button onClick={() => {
                setShowActivityForm(false);
                setEditingActivity(null);
              }} className="text-2xl text-primary-400">×</button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const activityData = {
                time: formData.get('time') as string || '09:00',
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                type: formData.get('type') as Activity['type'],
                duration: parseInt(formData.get('duration') as string),
                location: formData.get('location') as string,
                estimatedCost: {
                  currency: 'USD',
                  amount: parseInt(formData.get('cost') as string) || 0,
                  perPerson: true
                },
                included: formData.get('included') === 'on',
                optional: formData.get('optional') === 'on'
              };
              
              if (editingActivity !== null) {
                updateActivity(editingActivity, activityData);
              } else {
                addActivity(activityData);
              }
            }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">Activity Title</label>
                  <input 
                    name="title" 
                    type="text" 
                    required 
                    defaultValue={editingActivity !== null ? currentDay.activities[editingActivity]?.title || '' : ''}
                    className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">Type</label>
                  <select 
                    name="type" 
                    required 
                    defaultValue={editingActivity !== null ? currentDay.activities[editingActivity]?.type || 'activity' : 'activity'}
                    className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean"
                  >
                    <option value="activity">Activity</option>
                    <option value="sightseeing">Sightseeing</option>
                    <option value="adventure">Adventure</option>
                    <option value="cultural">Cultural</option>
                    <option value="meal">Meal</option>
                    <option value="transport">Transport</option>
                    <option value="accommodation">Accommodation</option>
                    <option value="shopping">Shopping</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="wellness">Wellness</option>
                    <option value="free-time">Free Time</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Description</label>
                <textarea 
                  name="description" 
                  rows={2} 
                  defaultValue={editingActivity !== null ? currentDay.activities[editingActivity]?.description || '' : ''}
                  className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">Time</label>
                  <input 
                    name="time" 
                    type="time" 
                    defaultValue={editingActivity !== null ? currentDay.activities[editingActivity]?.time || '09:00' : '09:00'}
                    className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">Duration (min)</label>
                  <input 
                    name="duration" 
                    type="number" 
                    min="15" 
                    step="15" 
                    defaultValue={editingActivity !== null ? currentDay.activities[editingActivity]?.duration || 60 : 60}
                    className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">Cost ($)</label>
                  <input 
                    name="cost" 
                    type="number" 
                    min="0" 
                    defaultValue={editingActivity !== null ? currentDay.activities[editingActivity]?.estimatedCost?.amount || 0 : 0}
                    className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">Location</label>
                  <input 
                    name="location" 
                    type="text" 
                    defaultValue={editingActivity !== null ? currentDay.activities[editingActivity]?.location || '' : ''}
                    className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" 
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center">
                  <input 
                    name="included" 
                    type="checkbox" 
                    defaultChecked={editingActivity !== null ? currentDay.activities[editingActivity]?.included !== false : true}
                    className="mr-2" 
                  />
                  <span className="text-sm">Included in price</span>
                </label>
                <label className="flex items-center">
                  <input 
                    name="optional" 
                    type="checkbox" 
                    defaultChecked={editingActivity !== null ? currentDay.activities[editingActivity]?.optional || false : false}
                    className="mr-2" 
                  />
                  <span className="text-sm">Optional activity</span>
                </label>
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => {
                  setShowActivityForm(false);
                  setEditingActivity(null);
                }}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingActivity !== null ? 'Update Activity' : 'Add Activity'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ItineraryBuilder;