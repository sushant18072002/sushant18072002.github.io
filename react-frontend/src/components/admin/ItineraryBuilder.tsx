import React, { useState } from 'react';
import Button from '@/components/common/Button';

interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  activities: string[];
}

interface ItineraryBuilderProps {
  initialItinerary?: {
    overview: string;
    days: ItineraryDay[];
  };
  onSave: (itinerary: { overview: string; days: ItineraryDay[] }) => void;
}

const ItineraryBuilder: React.FC<ItineraryBuilderProps> = ({ initialItinerary, onSave }) => {
  const [overview, setOverview] = useState(initialItinerary?.overview || '');
  const [days, setDays] = useState<ItineraryDay[]>(
    initialItinerary?.days || [{ day: 1, title: '', description: '', activities: [''] }]
  );

  const addDay = () => {
    setDays([...days, {
      day: days.length + 1,
      title: '',
      description: '',
      activities: ['']
    }]);
  };

  const removeDay = (index: number) => {
    const newDays = days.filter((_, i) => i !== index);
    // Renumber days
    const renumberedDays = newDays.map((day, i) => ({ ...day, day: i + 1 }));
    setDays(renumberedDays);
  };

  const updateDay = (index: number, field: keyof ItineraryDay, value: any) => {
    const newDays = [...days];
    newDays[index] = { ...newDays[index], [field]: value };
    setDays(newDays);
  };

  const addActivity = (dayIndex: number) => {
    const newDays = [...days];
    newDays[dayIndex].activities.push('');
    setDays(newDays);
  };

  const removeActivity = (dayIndex: number, activityIndex: number) => {
    const newDays = [...days];
    newDays[dayIndex].activities = newDays[dayIndex].activities.filter((_, i) => i !== activityIndex);
    setDays(newDays);
  };

  const updateActivity = (dayIndex: number, activityIndex: number, value: string) => {
    const newDays = [...days];
    newDays[dayIndex].activities[activityIndex] = value;
    setDays(newDays);
  };

  const handleSave = () => {
    const cleanedDays = days.map(day => ({
      ...day,
      activities: day.activities.filter(activity => activity.trim() !== '')
    }));
    onSave({ overview, days: cleanedDays });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-primary-900 mb-4">Itinerary Builder</h3>
        
        <div className="mb-6">
          <label className="block text-sm font-semibold text-primary-900 mb-2">Overview</label>
          <textarea
            value={overview}
            onChange={(e) => setOverview(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
            placeholder="Brief overview of the itinerary..."
          />
        </div>
      </div>

      <div className="space-y-4">
        {days.map((day, dayIndex) => (
          <div key={dayIndex} className="border border-primary-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-primary-900">Day {day.day}</h4>
              {days.length > 1 && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => removeDay(dayIndex)}
                >
                  Remove Day
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-primary-900 mb-2">Day Title</label>
                <input
                  type="text"
                  value={day.title}
                  onChange={(e) => updateDay(dayIndex, 'title', e.target.value)}
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                  placeholder="e.g., Arrival & City Tour"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-primary-900 mb-2">Description</label>
                <input
                  type="text"
                  value={day.description}
                  onChange={(e) => updateDay(dayIndex, 'description', e.target.value)}
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                  placeholder="Brief description of the day"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-primary-900">Activities</label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addActivity(dayIndex)}
                >
                  + Add Activity
                </Button>
              </div>
              
              <div className="space-y-2">
                {day.activities.map((activity, activityIndex) => (
                  <div key={activityIndex} className="flex gap-2">
                    <input
                      type="text"
                      value={activity}
                      onChange={(e) => updateActivity(dayIndex, activityIndex, e.target.value)}
                      className="flex-1 px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                      placeholder="e.g., Visit Eiffel Tower, Lunch at local restaurant"
                    />
                    {day.activities.length > 1 && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => removeActivity(dayIndex, activityIndex)}
                      >
                        ×
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={addDay}>
          + Add Day
        </Button>
        <Button onClick={handleSave}>
          Save Itinerary
        </Button>
      </div>
    </div>
  );
};

export default ItineraryBuilder;